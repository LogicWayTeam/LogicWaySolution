export const LOGICWAY_URL = process.env.REACT_APP_LOGICWAY_URL || window.REACT_APP_CONFIG?.LOGICWAY_URL;
//export const ROUTE_ENGINE_URL = process.env.REACT_APP_ROUTE_ENGINE_URL || window.REACT_APP_CONFIG?.ROUTE_ENGINE_URL

export const ROUTE_ENGINE_URL = `${LOGICWAY_URL}/routing/proxy_route_engine`;