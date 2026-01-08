function longestCommonPrefix(arr: string[]): string {
  if (arr.length === 0) return "";

  let prefix: string = arr[0];

  for (let i = 1; i < arr.length; i++) {
    while (!arr[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (prefix === "") return "";
    }
  }

  return prefix;
}

export default longestCommonPrefix;
