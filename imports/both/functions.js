export function pageToQuery(page) {
  const result = {};
  if (!isNaN(parseInt(page))) {
    page = parseInt(page);
    page = {
      perPage: 10,
      pageNum: page,
    };
  }
  const { perPage, pageNum } = page;
  result.skip = (pageNum - 1) * perPage;
  result.limit = pageNum * perPage;
  if (result.skip < 0) result.skip = 0;
  if (result.limit < 0) result.limit = 0;
  return result;
}
export function toDotize(jsonobj, prefix) {
  var newobj = {};

  function recurse(o, p, isArrayItem) {
    for (var f in o) {
      if (o[f] && typeof o[f] === "object") {
        if (Array.isArray(o[f]))
          newobj = recurse(o[f], (p ? p + "." : "") + f, true);
        // array
        else {
          if (isArrayItem) newobj = recurse(o[f], (p ? p : "") + "." + f + "");
          // array item object
          else newobj = recurse(o[f], (p ? p + "." : "") + f); // object
        }
      } else {
        if (isArrayItem) newobj[p + "." + f + ""] = o[f];
        // array item primitive
        else {
          let newP = p ? p + "." : "";
          newobj[newP + f] = o[f]; //
        }
      }
    }
    return newobj;
  }

  return recurse(jsonobj, prefix);
}
export function encryptObj(o, salt) {
  o = JSON.stringify(o).split("");
  for (var i = 0, l = o.length; i < l; i++)
    if (o[i] == "{") o[i] = "}";
    else if (o[i] == "}") o[i] = "{";
  return encodeURI(salt + o.join(""));
}

export function decryptObj(o, salt) {
  o = decodeURI(o);
  if (salt && o.indexOf(salt) != 0)
    throw new Error("object cannot be decrypted");
  o = o.substring(salt.length).split("");
  for (var i = 0, l = o.length; i < l; i++)
    if (o[i] == "{") o[i] = "}";
    else if (o[i] == "}") o[i] = "{";
  return JSON.parse(o.join(""));
}
