// ---- 假名到罗马音表（含常见拗音） ----
const kanaToRomaji: Record<string, string> = {
    "あ":"a","い":"i","う":"u","え":"e","お":"o",
    "か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko",
    "さ":"sa","し":"shi","す":"su","せ":"se","そ":"so",
    "た":"ta","ち":"chi","つ":"tsu","て":"te","と":"to",
    "な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no",
    "は":"ha","ひ":"hi","ふ":"fu","へ":"he","ほ":"ho",
    "ま":"ma","み":"mi","む":"mu","め":"me","も":"mo",
    "や":"ya","ゆ":"yu","よ":"yo",
    "ら":"ra","り":"ri","る":"ru","れ":"re","ろ":"ro",
    "わ":"wa","を":"o","ん":"n",
    "が":"ga","ぎ":"gi","ぐ":"gu","げ":"ge","ご":"go",
    "ざ":"za","じ":"ji","ず":"zu","ぜ":"ze","ぞ":"zo",
    "だ":"da","ぢ":"ji","づ":"zu","で":"de","ど":"do",
    "ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo",
    "ぱ":"pa","ぴ":"pi","ぷ":"pu","ぺ":"pe","ぽ":"po",
    // 拗音
    "きゃ":"kya","きゅ":"kyu","きょ":"kyo",
    "しゃ":"sha","しゅ":"shu","しょ":"sho",
    "ちゃ":"cha","ちゅ":"chu","ちょ":"cho",
    "にゃ":"nya","にゅ":"nyu","にょ":"nyo",
    "ひゃ":"hya","ひゅ":"hyu","ひょ":"hyo",
    "みゃ":"mya","みゅ":"myu","みょ":"myo",
    "りゃ":"rya","りゅ":"ryu","りょ":"ryo",
    "ぎゃ":"gya","ぎゅ":"gyu","ぎょ":"gyo",
    "じゃ":"ja","じゅ":"ju","じょ":"jo",
    "びゃ":"bya","びゅ":"byu","びょ":"byo",
    "ぴゃ":"pya","ぴゅ":"pyu","ぴょ":"pyo",
    // 小假名单映射备用
    "ゃ":"ya","ゅ":"yu","ょ":"yo","ぁ":"a","ぃ":"i","ぅ":"u","ぇ":"e","ぉ":"o"
};

// ---- 辅助判断 ----
function isHiragana(ch: string): boolean {
    if (!ch) return false;
    const cp = ch.codePointAt(0);
    return (cp! >= 0x3041 && cp! <= 0x3096) || ch === "ゔ";
}
function isKatakana(ch: string): boolean {
    if (!ch) return false;
    const cp = ch.codePointAt(0);
    return (cp! >= 0x30A1 && cp! <= 0x30FA) || ch === "ー";
}
function isKana(ch: string): boolean { return isHiragana(ch) || isKatakana(ch); }
function isSmallKana(ch: string): boolean { return "ゃゅょぁぃぅぇぉァィゥェォャュョ".includes(ch); }
const SOKUON = "っ";
function isPlus(ch: string): boolean { return ch === "＋" || ch === "+"; }
function kataToHiraChar(ch: string): string {
    if (!isKatakana(ch)) return ch;
    const cp = ch.codePointAt(0)!;
    if (cp >= 0x30A1 && cp <= 0x30F6) return String.fromCodePoint(cp - 0x60);
    return ch;
}

// ---- 转罗马音 ----
function romajiForKanaSeq(seq: string): string {
    const hiraSeq = [...seq].map(c => kataToHiraChar(c)).join("");
    let out = "";
    let i = 0;
    while (i < hiraSeq.length) {
        const ch = hiraSeq[i];
        if (ch === SOKUON) {
            if (i + 1 < hiraSeq.length) {
                if (i + 2 < hiraSeq.length && isSmallKana(hiraSeq[i+2])) {
                    const pair = hiraSeq[i+1] + hiraSeq[i+2];
                    if (kanaToRomaji[pair]) out += kanaToRomaji[pair][0];
                    else if (kanaToRomaji[hiraSeq[i+1]]) out += kanaToRomaji[hiraSeq[i+1]][0];
                } else if (kanaToRomaji[hiraSeq[i+1]]) out += kanaToRomaji[hiraSeq[i+1]][0];
            } else out += "t";
            i++; continue;
        }
        if (i + 1 < hiraSeq.length && isSmallKana(hiraSeq[i+1])) {
            const pair = hiraSeq[i] + hiraSeq[i+1];
            if (kanaToRomaji[pair]) { out += kanaToRomaji[pair]; i += 2; continue; }
        }
        if (ch === "は" || ch === "へ") { out += ch; i++; continue; }
        out += kanaToRomaji[ch] || ch;
        i++;
    }
    return out;
}

// ---- Token 类型 ----
type Token = { type: "ts" | "plus" | "kana" | "other"; text: string };

// ---- 分词 ----
function tokenizeB(B: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < B.length) {
        const ch = B[i];
        if (ch === "[") {
            const j = B.indexOf("]", i);
            if (j === -1) { tokens.push({type:"other", text:B.slice(i)}); break; }
            tokens.push({type:"ts", text:B.slice(i,j+1)});
            i = j+1; continue;
        }
        if (isPlus(ch)) { tokens.push({type:"plus", text:ch}); i++; continue; }
        if (isKana(ch) || ch === SOKUON || isSmallKana(ch)) {
            let j = i, s = "";
            while (j < B.length && (isKana(B[j]) || B[j] === SOKUON || isSmallKana(B[j]))) { s += B[j]; j++; }
            tokens.push({type:"kana", text:s});
            i = j; continue;
        }
        tokens.push({type:"other", text:ch}); i++;
    }
    return tokens;
}

// ---- 合并 plus ----
function mergeJoinPluses(tokens: Token[]): Token[] {
    let i = 0;
    while (i < tokens.length) {
        if (tokens[i].type === "plus") {
            const prev = tokens[i-1], next = tokens[i+1];
            if (prev && next && prev.type==="kana" && next.type==="kana") {
                prev.text = prev.text + next.text;
                tokens.splice(i, 2);
                i = Math.max(i-1,0); continue;
            } else i++;
        } else i++;
    }
    return tokens;
}

// ---- 转罗马音字符串 ----
function convertBtoRomaji(B: string): string {
    let tokens = tokenizeB(B);
    tokens = mergeJoinPluses(tokens);
    let out = "";
    for (const t of tokens) out += t.type==="kana"?romajiForKanaSeq(t.text):t.text;
    return out;
}

// ---- 匹配信息类型 ----
type MatchInfo = { start:number; end:number; A:string; Braw:string; raw:string; }

// ---- 处理整段文本 ----
function processWholeText(text: string): string {
    const regex = /\{([^|{}]+)\|([^}]*)\}/g;
    const matches: MatchInfo[] = [];
    let m;
    while ((m = regex.exec(text))!==null) {
        matches.push({start:m.index,end:regex.lastIndex,A:m[1],Braw:m[2],raw:m[0]});
    }
    if(matches.length===0) return text;

    let out = "", cursor=0;
    for(let i=0;i<matches.length;i++){
        const mt = matches[i];
        out += text.slice(cursor, mt.start);
        if(mt.A==="っ" && i+1<matches.length){
            const next = matches[i+1];
            const romajiCurr = convertBtoRomaji(mt.Braw);
            const romajiNext = convertBtoRomaji(next.Braw);
            const joiner = "＋";
            const left = romajiCurr.endsWith(joiner)?romajiCurr:romajiCurr+joiner;
            out += `{${mt.A+next.A}|${left+romajiNext}}`;
            i++; cursor = next.end;
        } else {
            out += `{${mt.A}|${convertBtoRomaji(mt.Braw)}}`;
            cursor = mt.end;
        }
    }
    out += text.slice(cursor);
    return out;
}

// ---- 导出函数 ----
export function handleKana2Romaji(input:string): string {
    return processWholeText(input);
}
