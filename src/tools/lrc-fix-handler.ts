import {kanaToRomaji} from "@/tools/kana-to-romaji-handler";

const romajiTable = Object.values(kanaToRomaji)

function extendTable(){
    /*const extendRomajiTable = [];
    for (const romaji of romajiTable){
      if (romaji.startsWith("p") ||
      romaji.startsWith("k") ||
      romaji.startsWith("s") ||
      romaji.startsWith("t")
      ){
        extendRomajiTable.push(romaji.slice(0,1)+romaji);
      }
    }
    romajiTable.push(...extendRomajiTable);
    //console.log(extendRomajiTable);*/
    romajiTable.push('s','t','p','k')
}

function splitRuby(line: string) {
    // 找第一个逗号
    const firstComma = line.indexOf(',');
    if (firstComma === -1) throw new Error("行格式不正确，缺少第一个逗号");

    const prefix = line.slice(0, firstComma + 1); // 包含第一个逗号
    let rest = line.slice(firstComma + 1);

    // 找第二个逗号（如果没有，endTime 为 null）
    const secondComma = rest.indexOf(',');
    let romaji, endTime;

    if (secondComma !== -1) {
        romaji = rest.slice(0, secondComma);
        endTime = rest.slice(secondComma); // 包含第二个逗号及后面所有
    } else {
        romaji = rest;
        endTime = null;
    }

    return [prefix, ...interleaveRomajiTimestamps(divTime(romaji)), endTime].join('');
}


function divTime(str: string){
    // 匹配字母或非[]字符，后面跟着可选的时间戳（保留中括号）
    const regex = /([a-zA-Z]+)(\[\d{2}:\d{2}:\d{2}\])?/g;

    let romaji = "";
    const timestamps = [];

    let match;
    while ((match = regex.exec(str)) !== null) {
        romaji += match[1]; // 字母部分
        if (match[2]) {
            timestamps.push(match[2]); // 保留中括号
        }
    }
    //console.log({ romaji, timestamps });
    return {romaji: splitRomaji(romaji), timestamps: timestamps};
}

function splitRomaji(input: string) {
    const devide_romaji= [];
    let index = 0;

    while (index < input.length) {
        let matched = false;

        // 尝试长度 3 -> 2 -> 1
        for (let len = 4; len >= 1; len--) {
            if (index + len > input.length) continue; // 超出长度跳过
            const sub = input.slice(index, index + len);
            if (romajiTable.includes(sub)) {
                devide_romaji.push(sub);
                index += len; // 移动指针
                matched = true;
                break;
            }
        }

        if (!matched) {
            console.error(`无法匹配音节，错误位置 index=${index}, 字符="${input[index]}"`)
            throw new Error(`无法匹配音节，错误位置 index=${index}, 字符="${input[index]}"`);

        }
    }

    return devide_romaji;
}
function interleaveRomajiTimestamps(obj: {romaji: string[],timestamps: string[]}) {
    const romaji = obj.romaji;
    const timestamps = obj.timestamps;
    const maxLen = Math.max(romaji.length, timestamps.length);
    const result = [];

    for (let i = 0; i < maxLen; i++) {
        result.push(romaji[i] || "");
        result.push(timestamps[i] || "");
    }

    return result;
}
extendTable();
export function handleRuby(input:string) {
    const output = [];
    const lines = input.split(/\r?\n/);

    for (const line of lines) {
        try {
            if (line.startsWith("@")) {
                const parsed = splitRuby(line); // 假设你已经有 splitRuby 函数
                output.push(parsed);
            }else{
                output.push(line);
            }
        } catch (e) {
            //console.error("解析失败:", line);
            output.push(e);
        }
    }
    return output.join('\n');
}
