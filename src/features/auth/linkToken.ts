// Lido uma única vez, na carga do módulo: o StrictMode renderiza duas vezes e a URL já estaria limpa na segunda.
// O token vem no fragmento (#), que o navegador não envia ao servidor; depois de lido, sai da URL e do histórico.
const token = new URLSearchParams(location.hash.slice(1)).get('token')
if (token) history.replaceState(null, '', location.pathname)

export const tokenDoLink = token
