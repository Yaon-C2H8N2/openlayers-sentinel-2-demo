import type { BunRequest } from "bun";

let COPERNICUS_TOKEN: string | null = null;

export async function serveCarto(request: BunRequest) {
  const functions: {
    [key: string]: (request: BunRequest) => Promise<Response>;
  } = {
    searchImages: searchImages,
    fetchImage: fetchImage,
    getInstanceId: getInstanceId,
  };

  const url = new URL(request.url);
  const path = url.pathname.replace("/api/carto/", "");
  const func = functions[path];

  if (func) {
    if (!COPERNICUS_TOKEN) {
      COPERNICUS_TOKEN = (await getToken()).access_token;
    }

    const response = await func(request);
    if (response.status === 401) {
      COPERNICUS_TOKEN = (await getToken()).access_token;
      return await func(request);
    }

    return response;
  } else {
    return new Response("Not Found", { status: 404 });
  }
}

async function getToken() {
  const client_id = process.env.COPERNICUS_CLIENT_ID;
  const client_secret = process.env.COPERNICUS_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    throw new Error(
      "Client ID or Client Secret not set in environment variables",
    );
  }

  const response = await fetch(
    "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: client_id,
        client_secret: client_secret,
      }),
    },
  );

  if (response.status !== 200) {
    throw new Error("Failed to fetch token");
  }
  return (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
}

export async function searchImages(request: BunRequest) {
  const url = new URL(request.url);
  const bboxParam = url.searchParams.get("bbox");
  const fromDate = url.searchParams.get("fromDate");
  const toDate = url.searchParams.get("toDate");
  const cloudCover = parseInt(url.searchParams.get("cloudCover") ?? "-1");

  if (
    bboxParam === null ||
    fromDate === null ||
    toDate === null ||
    isNaN(cloudCover) ||
    cloudCover < 0
  ) {
    return new Response("Missing or invalid search parameters", {
      status: 400,
    });
  }

  const requestBody = {
    bbox: bboxParam.split(",").map(Number),
    datetime: `${fromDate}T00:00:00Z/${toDate}T23:59:59Z`,
    collections: ["sentinel-2-l2a"],
    limit: 10,
    filter: `eo:cloud_cover<=${cloudCover}`,
  };

  const response = await fetch(
    "https://sh.dataspace.copernicus.eu/api/v1/catalog/1.0.0/search",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COPERNICUS_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    },
  );

  return new Response(
    JSON.stringify({
      response: await response.json(),
    }),
    {
      status: response.status,
    },
  );
}

export async function fetchImage(request: BunRequest) {
  const url = new URL(request.url);
  const bboxParam = url.searchParams.get("bbox");
  const fromDate = url.searchParams.get("fromDate");
  const toDate = url.searchParams.get("toDate");
  const cloudCover = parseInt(url.searchParams.get("cloudCover") ?? "-1");

  if (
    bboxParam === null ||
    fromDate === null ||
    toDate === null ||
    isNaN(cloudCover) ||
    cloudCover < 0
  ) {
    return new Response("Missing or invalid search parameters", {
      status: 400,
    });
  }

  const evalscript = `
  //VERSION=3
  function setup() {
    return {
      input: ["B02", "B03", "B04"],
      output: {
        bands: 3,
        sampleType: "AUTO", // default value - scales the output values from [0,1] to [0,255].
      },
    }
  }

  function evaluatePixel(sample) {
    return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02]
  }
  `;
  const requestBody = {
    input: {
      bounds: {
        properties: { crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84" },
        bbox: bboxParam.split(",").map(Number),
      },
      data: [
        {
          type: "sentinel-2-l2a",
          dataFilter: {
            timeRange: {
              from: `${fromDate}T00:00:00Z`,
              to: `${toDate}T00:00:00Z`,
            },
            maxCloudCoverage: cloudCover,
          },
        },
      ],
    },
    output: {
      width: 2500,
      height: 2500,
    },
    evalscript: evalscript,
  };

  const response = await fetch(
    "https://sh.dataspace.copernicus.eu/api/v1/process",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COPERNICUS_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    },
  );

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "image/png",
    },
  });
}

const getInstanceId = async (request: BunRequest) => {
  const instanceId = process.env.COPERNICUS_INSTANCE_ID;

  if (!instanceId) {
    return new Response("Instance ID not set in environment variables", {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ instanceId: instanceId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
