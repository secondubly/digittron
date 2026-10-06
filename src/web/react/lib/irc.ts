// IRC line -> tags + prefix + command + target + text
export function parseLine(raw: string) {
    let line = raw
    const tags: Record<string, string> = {}
    if (line.startsWith("@")) {
        const end = line.indexOf(" ")
        for (const kv of line.slice(1, end).split(";")) {
            const [k, v = ""] = kv.split("=")
            if (k) tags[k] = v
        }
        line = line.slice(end + 1)
    }
    const m = /^(?::(\S+) )?(\S+)(?: (\S+))?(?: :?(.*))?$/.exec(line)
    return { tags, prefix: m?.[1] ?? "", command: m?.[2] ?? "", target: m?.[3] ?? "", text: m?.[4] ?? "" }
}
