type ServiceKind = "auth" | "core";

type ServiceConfig = {
  envName: "AUTH_SERVICE_URL" | "CORE_SERVICE_URL";
  rawValue: string;
  normalizedUrl: string;
  origin: string;
  host: string;
  pathname: string;
};

const DEVELOPMENT_DEFAULTS: Record<ServiceKind, string> = {
  auth: "http://localhost:5001/api/auth",
  core: "http://localhost:5007/api/core",
};

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function normalizePathname(pathname: string): string {
  const collapsed = pathname.replace(/\/{2,}/g, "/");
  return collapsed.length > 1 ? trimTrailingSlash(collapsed) : collapsed;
}

function getEnvName(kind: ServiceKind): ServiceConfig["envName"] {
  return kind === "auth" ? "AUTH_SERVICE_URL" : "CORE_SERVICE_URL";
}

function getDefaultUrl(kind: ServiceKind): string {
  return DEVELOPMENT_DEFAULTS[kind];
}

export function isProxyDebugEnabled(): boolean {
  return process.env.API_PROXY_DEBUG === "true";
}

export function getServiceConfig(kind: ServiceKind): ServiceConfig {
  const envName = getEnvName(kind);
  const configuredValue = process.env[envName]?.trim();
  const rawValue =
    configuredValue ||
    (process.env.NODE_ENV !== "production" ? getDefaultUrl(kind) : "");

  if (!rawValue) {
    throw new Error(
      `${envName} is not set. Define it in the environment for this deployment.`,
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawValue);
  } catch {
    throw new Error(
      `${envName} must be an absolute URL. Received: "${rawValue}"`,
    );
  }

  const normalizedPathname = normalizePathname(parsedUrl.pathname || "/");
  if (normalizedPathname.includes("/api/api")) {
    throw new Error(
      `${envName} contains a duplicated "/api/api" segment: "${rawValue}"`,
    );
  }

  if (kind === "auth" && !normalizedPathname.includes("/api/auth")) {
    throw new Error(
      `${envName} must include "/api/auth" in its path. Received: "${rawValue}"`,
    );
  }

  parsedUrl.pathname = normalizedPathname;
  parsedUrl.search = "";
  parsedUrl.hash = "";

  const normalizedUrl = trimTrailingSlash(parsedUrl.toString());

  return {
    envName,
    rawValue,
    normalizedUrl,
    origin: parsedUrl.origin,
    host: parsedUrl.host,
    pathname: normalizedPathname,
  };
}

export function getAuthProxyTarget(slugPath: string, search: string): string {
  const config = getServiceConfig("auth");

  if (slugPath.startsWith("profile")) {
    const authBasePath = config.pathname.replace(/\/api\/auth$/, "");
    return `${config.origin}${authBasePath}/api/${slugPath}${search}`;
  }

  return `${config.normalizedUrl}/${slugPath}${search}`;
}

export function getCoreProxyTarget(slugPath: string, search: string): string {
  const config = getServiceConfig("core");
  return `${config.normalizedUrl}/${slugPath}${search}`;
}
