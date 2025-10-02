const kanaToRomaji: Record<string, string> = {
    //清音
    "あ":"a","い":"i","う":"u","え":"e","お":"o",
    "か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko",
    "さ":"sa","し":"shi","す":"su","せ":"se","そ":"so",
    "た":"ta","ち":"chi","つ":"tsu","て":"te","と":"to",
    "な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no",
    "は":"ha","ひ":"hi","ふ":"fu","へ":"he","ほ":"ho",
    "ま":"ma","み":"mi","む":"mu","め":"me","も":"mo",
    "や":"ya","ゆ":"yu","よ":"yo",
    "ら":"ra","り":"ri","る":"ru","れ":"re","ろ":"ro",
    "わ":"wa","ゐ":"wi","ゔ":"vu","ゑ":"we","を":"wo",
    "ヷ":"va","ヸ":"vi","ん":"n","ヹ":"ve","ヺ":"vo",
    //浊音&半浊音
    "が":"ga","ぎ":"gi","ぐ":"gu","げ":"ge","ご":"go",
    "ざ":"za","じ":"ji","ず":"zu","ぜ":"ze","ぞ":"zo",
    "だ":"da","ぢ":"ji","づ":"zu","で":"de","ど":"do",
    "ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo",
    "ぱ":"pa","ぴ":"pi","ぷ":"pu","ぺ":"pe","ぽ":"po",
    // 拗音
    "きゃ":"kya",            "きゅ":"kyu",            "きょ":"kyo",
    "しゃ":"sha",            "しゅ":"shu","しぇ":"she","しょ":"sho",
    "ちゃ":"cha",            "ちゅ":"chu","ちぇ":"che","ちょ":"cho",
    "にゃ":"nya",            "にゅ":"nyu",            "にょ":"nyo",
    "ひゃ":"hya",            "ひゅ":"hyu",            "ひょ":"hyo",
    "みゃ":"mya",            "みゅ":"myu",            "みょ":"myo",
    "りゃ":"rya",            "りゅ":"ryu",            "りょ":"ryo",
    "ぎゃ":"gya",            "ぎゅ":"gyu",            "ぎょ":"gyo",
    "じゃ":"ja",             "じゅ":"ju", "じぇ":"je", "じょ":"jo",
    "びゃ":"bya",            "びゅ":"byu",            "びょ":"byo",
    "ぴゃ":"pya",            "ぴゅ":"pyu",            "ぴょ":"pyo",
    "ゔゃ":"vya","ゔぃ":"vi", "ゔゅ":"vyu","ゔぇ":"ve", "ゔょ":"vyo",
    "ゔぁ":"va",                                     "ゔぉ":"vo",
                "てぃ":"ti", "てゅ":"tyu",
                "でぃ":"di", "でゅ":"dyu",
    "ふぁ":"fa", "ふぃ":"fi", "ふゅ":"fyu","ふぇ":"fe", "ふぉ":"fo",

    // 小假名
    "ゃ":"ya","ゅ":"yu","ょ":"yo","ぁ":"a","ぃ":"i","ぅ":"u","ぇ":"e","ぉ":"o","ゕ":"ka","ゖ":"ke"


};

//平假名
function isHiragana(ch: string): boolean {
    if (!ch.length) return false;
    const cp = ch.codePointAt(0);
    return (cp! >= 0x3041 && cp! <= 0x3096);
    //return (cp! >= "ぁ".codePointAt(0)! && cp! <= "ゖ".codePointAt(0)!);
}
//片假名
function isKatakana(ch: string): boolean {
    if (!ch.length) return false;
    const cp = ch.codePointAt(0);
    return (cp! >= 0x30A1 && cp! <= 0x30FA) || ch === "ー";
    //return (cp! >= "ァ".codePointAt(0)! && cp! <= "ヺ".codePointAt(0)!) || ch === "ー";
}
//假名
function isKana(ch: string): boolean { return isHiragana(ch) || isKatakana(ch); }
//小假名
function isSmallKana(ch: string): boolean { return "ゃゅょぁぃぅぇぉァィゥェォャュョ".includes(ch); }
//促音符号
const SOKUON = "っ";
//加号(工程文件中表示连结)
function isPlus(ch: string): boolean { return ch === "＋" || ch === "+"; }
//片假名转换为平假名
function kataToHiraChar(ch: string): string {
    if (!isKatakana(ch)) return ch;
    const cp = ch.codePointAt(0)!;
    //这个范围是片假名中ァ到ヶ的范围，其在平假名均有映射
    if (cp >= 0x30A1 && cp <= 0x30F6) return String.fromCodePoint(cp - 0x60);
    return ch;
}

function romajiForKanaSeq(seq: string): string {
    //片假名转平假名
    const hiraSeq = [...seq].map(c => kataToHiraChar(c)).join("");
    let out = "";
    let i = 0;
    //逐字匹配
    while (i < hiraSeq.length) {
        const ch = hiraSeq[i];
        //遇到促音符号
        if (ch === SOKUON) {
            //如果存在下一个(先前已经处理过)
            if (i + 1 < hiraSeq.length) {
                //下一个是拗音
                if (i + 2 < hiraSeq.length && isSmallKana(hiraSeq[i+2])) {
                    //组合拗音符号
                    const pair = hiraSeq[i+1] + hiraSeq[i+2];
                    //直接查表，若匹配则加上匹配结果的首字母
                    if (kanaToRomaji[pair]) out += kanaToRomaji[pair][0];
                    //不匹配，直接查找下一个音，添加其首字母
                    else if (kanaToRomaji[hiraSeq[i+1]]) out += kanaToRomaji[hiraSeq[i+1]][0];
                //下一个不是拗音，直接查下一个音，添加首字母
                } else if (kanaToRomaji[hiraSeq[i+1]]) out += kanaToRomaji[hiraSeq[i+1]][0];
            } else out += "t";
            i++; continue;
        }
        //处理拗音
        if (i + 1 < hiraSeq.length && isSmallKana(hiraSeq[i+1])) {
            const pair = hiraSeq[i] + hiraSeq[i+1];
            if (kanaToRomaji[pair]) { out += kanaToRomaji[pair]; i += 2; continue; }
        }
        //if (ch === "は" || ch === "へ") { out += ch; i++; continue; }
        //处理正常假名
        out += kanaToRomaji[ch] || ch;
        i++;
    }
    return out;
}

//           { 类型: 时间戳 |  加号   |  假名   |  其他   ; 文本内容      }
type Token = { type: "ts" | "plus" | "kana" | "other"; text: string };

function tokenizeB(B: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    //遍历拆分B的字符串
    while (i < B.length) {
        const ch = B[i];
        //匹配时间戳
        if (ch === "[") {
            const j = B.indexOf("]", i);
            if (j === -1) { tokens.push({type:"other", text:B.slice(i)}); break; }
            tokens.push({type:"ts", text:B.slice(i,j+1)});
            i = j+1; continue;
        }
        //匹配加号
        if (isPlus(ch)) { tokens.push({type:"plus", text:ch}); i++; continue; }
        //匹配假名
        if (isKana(ch) || ch === SOKUON || isSmallKana(ch)) {
            let j = i, s = "";
            while (j < B.length && (isKana(B[j]) || B[j] === SOKUON || isSmallKana(B[j]))) { s += B[j]; j++; }
            tokens.push({type:"kana", text:s});
            i = j; continue;
        }
        //未匹配
        tokens.push({type:"other", text:ch}); i++;
    }
    return tokens;
}

//合并加号两端假名
function mergeJoinPluses(tokens: Token[]): Token[] {
    let i = 0;
    //遍历
    while (i < tokens.length) {
        //如果遇到加号
        if (tokens[i].type === "plus") {
            const prev = tokens[i-1], next = tokens[i+1];
            if (prev && next && prev.type==="kana" && next.type==="kana") {
                prev.text = prev.text + next.text;
                tokens.splice(i, 2);
                i = Math.max(i-1,0);
            } else i++;
        } else i++; //没有遇到，直接过
    }
    return tokens;
}

//修正时间戳标记
function fixTimeStamp(tokens: Token[]): Token[] {
    //console.log(tokens)
    let i = 0;
    const tsTokens = tokens.filter(token => token.type === 'ts');
    while (i < tsTokens.length) {
        tsTokens[i].text = tsTokens[i].text.replace(/\[(\d+)\|/, `[${i === 0 ? `${tsTokens.length}|` : ''}`);
        i++;
    }
    //console.log(tokens);
    return tokens;
}



//把B部分的假名转化为罗马音
function convertBtoRomaji(B: string): string {
    //把B拆分为不同类型的分块
    let tokens = tokenizeB(B);
    //这里合并加号是为了处理拗音
    //如{しゅ|[1|00:26:88]し＋ゅ}{わ|[1|00:27:04]わ}{しゅ|[1|00:27:20]し＋ゅ}{わ|[1|00:27:55]わ}
    tokens = mergeJoinPluses(tokens);
    tokens = fixTimeStamp(tokens);
    let out = "";
    //如果类型为假名，那么转罗马音，组合tokens
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i]
        if (t.type === "kana"){
            const leftSentence =
                tokens.filter(
                    (token,index) =>
                        token.type === "kana" && index >= i
                ).map(token => token.text)
                    .join('').slice(0,2);
            if (t.text === SOKUON) {
                out += romajiForKanaSeq(leftSentence).slice(0,1)
            }else {
                out += romajiForKanaSeq(t.text)
            }
        }else{
            out += t.text;
        }
    }
    return out;
}


type MatchInfo = { start:number; end:number; A:string; Braw:string; raw:string; }

//处理传入的整段文本
function processWholeText(text: string): string {
    //匹配           {    A     |   B   }
    const regex = /\{([^|{}]+)\|([^}]*)}/g;
    const matches: MatchInfo[] = [];
    let m;
    while ((m = regex.exec(text))!==null) {
        //把匹配到的结果存储在matches中
        matches.push({
            start:m.index,
            end:regex.lastIndex,
            A:m[1],     //被注音的文本(A)
            Braw:m[2], //注音在这里(B)
            raw:m[0]    //{A|B}
        });
    }
    if(matches.length===0) return text;

    let out = "", cursor=0;
    //遍历匹配的数组
    for(let i=0;i<matches.length;i++){
        const mt = matches[i];
        //把未匹配出来的原文加上去
        out += text.slice(cursor, mt.start);
        //A部分为促音符号，那么找下一个match元素
        if(mt.A==="っ" && i+1<matches.length){
            const next = matches[i+1];
            //假名转罗马音(促音转化内部已经写好了取下一个的开头字母)
            const mergedRomaji = convertBtoRomaji(mt.Braw+next.Braw);
            out += `{${mt.A+next.A}|${mergedRomaji}}`;
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
