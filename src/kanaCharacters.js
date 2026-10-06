import { kanjiUsage } from './kanjiUsage.js';
import { kanjiUsageMeanings } from './kanjiUsageMeanings.js';
import { kanjiReadings, validateKanjiReadings } from './kanjiReadings.js';

// Generated with our favorite GPT

/*
Structure:

{
  "hiragana": {
    "a"{
      "title": "あ",
      "tags": [ "main_kana" ],
      "characters": {
        "a": {
          "jp_character": "あ",
          "romanji": [ "a" ],
          "sound": "あ"
        },
        "i": {
          "jp_character": "い",
          "romanji": [ "i" ],
          "sound": "い"
        },
                . . .
      }
    },
    "k": {
      "title": "か",
      "tags": [ "main_kana" ],
      "characters": {
        "a": {
          "jp_character": "か",
          "romanji": [ "ka" ],
          "sound": "か"
        },
        "i": {
          "jp_character": "き",
          "romanji": [ "ki" ],
          "sound": "き"
        },
                . . .
      }
    }
  },
  "katakana": {
        . . .
  },
  "words": {
    "title": "words",
    "tags": [ "main_kana" ],
    "characters": {
      "kawaii": {
        "jp_character": "かわいい",
        "romanji": [ "kawaii" ],
        "sound": "かわいい",
        "meaning": "cute",
        "meaning_id": "imut" // Indonesian meaning
      },
      "jouzu": {
        "jp_character": "じょうず",
        "romanji": [ "jouzu" ],
        "sound": "じょうず",
        "meaning": "skillful",
        "meaning_id": "pandai" // Indonesian meaning
      }
    }
  }
}
*/
export const kanaCharacters = {
  "hiragana": {
    "a": {
      "title": "あ",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "あ",
          "romanji": [
            "a"
          ],
          "sound": "あ"
        },
        "i": {
          "jp_character": "い",
          "romanji": [
            "i"
          ],
          "sound": "い"
        },
        "u": {
          "jp_character": "う",
          "romanji": [
            "u"
          ],
          "sound": "う"
        },
        "e": {
          "jp_character": "え",
          "romanji": [
            "e"
          ],
          "sound": "え"
        },
        "o": {
          "jp_character": "お",
          "romanji": [
            "o"
          ],
          "sound": "お"
        }
      }
    },
    "k": {
      "title": "か",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "か",
          "romanji": [
            "ka"
          ],
          "sound": "か"
        },
        "i": {
          "jp_character": "き",
          "romanji": [
            "ki"
          ],
          "sound": "き"
        },
        "u": {
          "jp_character": "く",
          "romanji": [
            "ku"
          ],
          "sound": "く"
        },
        "e": {
          "jp_character": "け",
          "romanji": [
            "ke"
          ],
          "sound": "け"
        },
        "o": {
          "jp_character": "こ",
          "romanji": [
            "ko"
          ],
          "sound": "こ"
        }
      }
    },
    "s": {
      "title": "さ",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "さ",
          "romanji": [
            "sa"
          ],
          "sound": "さ"
        },
        "i": {
          "jp_character": "し",
          "romanji": [
            "shi"
          ],
          "sound": "し"
        },
        "u": {
          "jp_character": "す",
          "romanji": [
            "su"
          ],
          "sound": "す"
        },
        "e": {
          "jp_character": "せ",
          "romanji": [
            "se"
          ],
          "sound": "せ"
        },
        "o": {
          "jp_character": "そ",
          "romanji": [
            "so"
          ],
          "sound": "そ"
        }
      }
    },
    "t": {
      "title": "た",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "た",
          "romanji": [
            "ta"
          ],
          "sound": "た"
        },
        "i": {
          "jp_character": "ち",
          "romanji": [
            "chi"
          ],
          "sound": "ち"
        },
        "u": {
          "jp_character": "つ",
          "romanji": [
            "tsu"
          ],
          "sound": "つ"
        },
        "e": {
          "jp_character": "て",
          "romanji": [
            "te"
          ],
          "sound": "て"
        },
        "o": {
          "jp_character": "と",
          "romanji": [
            "to"
          ],
          "sound": "と"
        }
      }
    },
    "n": {
      "title": "な",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "な",
          "romanji": [
            "na"
          ],
          "sound": "な"
        },
        "i": {
          "jp_character": "に",
          "romanji": [
            "ni"
          ],
          "sound": "に"
        },
        "u": {
          "jp_character": "ぬ",
          "romanji": [
            "nu"
          ],
          "sound": "ぬ"
        },
        "e": {
          "jp_character": "ね",
          "romanji": [
            "ne"
          ],
          "sound": "ね"
        },
        "o": {
          "jp_character": "の",
          "romanji": [
            "no"
          ],
          "sound": "の"
        }
      }
    },
    "h": {
      "title": "は",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "は",
          "romanji": [
            "ha"
          ],
          "sound": "は"
        },
        "i": {
          "jp_character": "ひ",
          "romanji": [
            "hi"
          ],
          "sound": "ひ"
        },
        "u": {
          "jp_character": "ふ",
          "romanji": [
            "fu"
          ],
          "sound": "ふ"
        },
        "e": {
          "jp_character": "へ",
          "romanji": [
            "he"
          ],
          "sound": "へ"
        },
        "o": {
          "jp_character": "ほ",
          "romanji": [
            "ho"
          ],
          "sound": "ほ"
        }
      }
    },
    "m": {
      "title": "ま",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "ま",
          "romanji": [
            "ma"
          ],
          "sound": "ま"
        },
        "i": {
          "jp_character": "み",
          "romanji": [
            "mi"
          ],
          "sound": "み"
        },
        "u": {
          "jp_character": "む",
          "romanji": [
            "mu"
          ],
          "sound": "む"
        },
        "e": {
          "jp_character": "め",
          "romanji": [
            "me"
          ],
          "sound": "め"
        },
        "o": {
          "jp_character": "も",
          "romanji": [
            "mo"
          ],
          "sound": "も"
        }
      }
    },
    "y": {
      "title": "や",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "や",
          "romanji": [
            "ya"
          ],
          "sound": "や"
        },
        "u": {
          "jp_character": "ゆ",
          "romanji": [
            "yu"
          ],
          "sound": "ゆ"
        },
        "o": {
          "jp_character": "よ",
          "romanji": [
            "yo"
          ],
          "sound": "よ"
        }
      }
    },
    "r": {
      "title": "ら",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "ら",
          "romanji": [
            "ra"
          ],
          "sound": "ら"
        },
        "i": {
          "jp_character": "り",
          "romanji": [
            "ri"
          ],
          "sound": "り"
        },
        "u": {
          "jp_character": "る",
          "romanji": [
            "ru"
          ],
          "sound": "る"
        },
        "e": {
          "jp_character": "れ",
          "romanji": [
            "re"
          ],
          "sound": "れ"
        },
        "o": {
          "jp_character": "ろ",
          "romanji": [
            "ro"
          ],
          "sound": "ろ"
        }
      }
    },
    "w": {
      "title": "わ",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "わ",
          "romanji": [
            "wa"
          ],
          "sound": "わ"
        },
        "o": {
          "jp_character": "を",
          "romanji": [
            "wo"
          ],
          "sound": "を"
        },
        "u": {
          "jp_character": "ん",
          "romanji": [
            "n"
          ],
          "sound": "ん"
        }
      }
    },
    "g": {
      "title": "が",
      "tags": [
        "dakuten_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "が",
          "romanji": [
            "ga"
          ],
          "sound": "が"
        },
        "i": {
          "jp_character": "ぎ",
          "romanji": [
            "gi"
          ],
          "sound": "ぎ"
        },
        "u": {
          "jp_character": "ぐ",
          "romanji": [
            "gu"
          ],
          "sound": "ぐ"
        },
        "e": {
          "jp_character": "げ",
          "romanji": [
            "ge"
          ],
          "sound": "げ"
        },
        "o": {
          "jp_character": "ご",
          "romanji": [
            "go"
          ],
          "sound": "ご"
        }
      }
    },
    "z": {
      "title": "ざ",
      "tags": [
        "dakuten_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "ざ",
          "romanji": [
            "za"
          ],
          "sound": "ざ"
        },
        "i": {
          "jp_character": "じ",
          "romanji": [
            "ji"
          ],
          "sound": "じ"
        },
        "u": {
          "jp_character": "ず",
          "romanji": [
            "zu"
          ],
          "sound": "ず"
        },
        "e": {
          "jp_character": "ぜ",
          "romanji": [
            "ze"
          ],
          "sound": "ぜ"
        },
        "o": {
          "jp_character": "ぞ",
          "romanji": [
            "zo"
          ],
          "sound": "ぞ"
        }
      }
    },
    "d": {
      "title": "だ",
      "tags": [
        "dakuten_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "だ",
          "romanji": [
            "da"
          ],
          "sound": "だ"
        },
        "i": {
          "jp_character": "ぢ",
          "romanji": [
            "ji"
          ],
          "sound": "ぢ"
        },
        "u": {
          "jp_character": "づ",
          "romanji": [
            "zu"
          ],
          "sound": "づ"
        },
        "e": {
          "jp_character": "で",
          "romanji": [
            "de"
          ],
          "sound": "で"
        },
        "o": {
          "jp_character": "ど",
          "romanji": [
            "do"
          ],
          "sound": "ど"
        }
      }
    },
    "b": {
      "title": "ば",
      "tags": [
        "dakuten_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "ば",
          "romanji": [
            "ba"
          ],
          "sound": "ば"
        },
        "i": {
          "jp_character": "び",
          "romanji": [
            "bi"
          ],
          "sound": "び"
        },
        "u": {
          "jp_character": "ぶ",
          "romanji": [
            "bu"
          ],
          "sound": "ぶ"
        },
        "e": {
          "jp_character": "べ",
          "romanji": [
            "be"
          ],
          "sound": "べ"
        },
        "o": {
          "jp_character": "ぼ",
          "romanji": [
            "bo"
          ],
          "sound": "ぼ"
        }
      }
    },
    "p": {
      "title": "ぱ",
      "tags": [
        "dakuten_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "ぱ",
          "romanji": [
            "pa"
          ],
          "sound": "ぱ"
        },
        "i": {
          "jp_character": "ぴ",
          "romanji": [
            "pi"
          ],
          "sound": "ぴ"
        },
        "u": {
          "jp_character": "ぷ",
          "romanji": [
            "pu"
          ],
          "sound": "ぷ"
        },
        "e": {
          "jp_character": "ぺ",
          "romanji": [
            "pe"
          ],
          "sound": "ぺ"
        },
        "o": {
          "jp_character": "ぽ",
          "romanji": [
            "po"
          ],
          "sound": "ぽ"
        }
      }
    }
  },
  "katakana": {
    "a": {
      "title": "ア",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "ア",
          "romanji": [
            "a"
          ],
          "sound": "ア"
        },
        "i": {
          "jp_character": "イ",
          "romanji": [
            "i"
          ],
          "sound": "イ"
        },
        "u": {
          "jp_character": "ウ",
          "romanji": [
            "u"
          ],
          "sound": "ウ"
        },
        "e": {
          "jp_character": "エ",
          "romanji": [
            "e"
          ],
          "sound": "エ"
        },
        "o": {
          "jp_character": "オ",
          "romanji": [
            "o"
          ],
          "sound": "オ"
        }
      }
    },
    "k": {
      "title": "カ",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "カ",
          "romanji": [
            "ka"
          ],
          "sound": "カ"
        },
        "i": {
          "jp_character": "キ",
          "romanji": [
            "ki"
          ],
          "sound": "キ"
        },
        "u": {
          "jp_character": "ク",
          "romanji": [
            "ku"
          ],
          "sound": "ク"
        },
        "e": {
          "jp_character": "ケ",
          "romanji": [
            "ke"
          ],
          "sound": "ケ"
        },
        "o": {
          "jp_character": "コ",
          "romanji": [
            "ko"
          ],
          "sound": "コ"
        }
      }
    },
    "s": {
      "title": "サ",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "サ",
          "romanji": [
            "sa"
          ],
          "sound": "サ"
        },
        "i": {
          "jp_character": "シ",
          "romanji": [
            "shi"
          ],
          "sound": "シ"
        },
        "u": {
          "jp_character": "ス",
          "romanji": [
            "su"
          ],
          "sound": "ス"
        },
        "e": {
          "jp_character": "セ",
          "romanji": [
            "se"
          ],
          "sound": "セ"
        },
        "o": {
          "jp_character": "ソ",
          "romanji": [
            "so"
          ],
          "sound": "ソ"
        }
      }
    },
    "t": {
      "title": "タ",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "タ",
          "romanji": [
            "ta"
          ],
          "sound": "タ"
        },
        "i": {
          "jp_character": "チ",
          "romanji": [
            "chi"
          ],
          "sound": "チ"
        },
        "u": {
          "jp_character": "ツ",
          "romanji": [
            "tsu"
          ],
          "sound": "ツ"
        },
        "e": {
          "jp_character": "テ",
          "romanji": [
            "te"
          ],
          "sound": "テ"
        },
        "o": {
          "jp_character": "ト",
          "romanji": [
            "to"
          ],
          "sound": "ト"
        }
      }
    },
    "n": {
      "title": "ナ",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "ナ",
          "romanji": [
            "na"
          ],
          "sound": "ナ"
        },
        "i": {
          "jp_character": "ニ",
          "romanji": [
            "ni"
          ],
          "sound": "ニ"
        },
        "u": {
          "jp_character": "ヌ",
          "romanji": [
            "nu"
          ],
          "sound": "ヌ"
        },
        "e": {
          "jp_character": "ネ",
          "romanji": [
            "ne"
          ],
          "sound": "ネ"
        },
        "o": {
          "jp_character": "ノ",
          "romanji": [
            "no"
          ],
          "sound": "ノ"
        }
      }
    },
    "h": {
      "title": "ハ",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "ハ",
          "romanji": [
            "ha"
          ],
          "sound": "ハ"
        },
        "i": {
          "jp_character": "ヒ",
          "romanji": [
            "hi"
          ],
          "sound": "ヒ"
        },
        "u": {
          "jp_character": "フ",
          "romanji": [
            "fu"
          ],
          "sound": "フ"
        },
        "e": {
          "jp_character": "ヘ",
          "romanji": [
            "he"
          ],
          "sound": "ヘ"
        },
        "o": {
          "jp_character": "ホ",
          "romanji": [
            "ho"
          ],
          "sound": "ホ"
        }
      }
    },
    "m": {
      "title": "マ",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "マ",
          "romanji": [
            "ma"
          ],
          "sound": "マ"
        },
        "i": {
          "jp_character": "ミ",
          "romanji": [
            "mi"
          ],
          "sound": "ミ"
        },
        "u": {
          "jp_character": "ム",
          "romanji": [
            "mu"
          ],
          "sound": "ム"
        },
        "e": {
          "jp_character": "メ",
          "romanji": [
            "me"
          ],
          "sound": "メ"
        },
        "o": {
          "jp_character": "モ",
          "romanji": [
            "mo"
          ],
          "sound": "モ"
        }
      }
    },
    "y": {
      "title": "ヤ",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "ヤ",
          "romanji": [
            "ya"
          ],
          "sound": "ヤ"
        },
        "u": {
          "jp_character": "ユ",
          "romanji": [
            "yu"
          ],
          "sound": "ユ"
        },
        "o": {
          "jp_character": "ヨ",
          "romanji": [
            "yo"
          ],
          "sound": "ヨ"
        }
      }
    },
    "r": {
      "title": "ラ",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "ラ",
          "romanji": [
            "ra"
          ],
          "sound": "ラ"
        },
        "i": {
          "jp_character": "リ",
          "romanji": [
            "ri"
          ],
          "sound": "リ"
        },
        "u": {
          "jp_character": "ル",
          "romanji": [
            "ru"
          ],
          "sound": "ル"
        },
        "e": {
          "jp_character": "レ",
          "romanji": [
            "re"
          ],
          "sound": "レ"
        },
        "o": {
          "jp_character": "ロ",
          "romanji": [
            "ro"
          ],
          "sound": "ロ"
        }
      }
    },
    "w": {
      "title": "ワ",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "ワ",
          "romanji": [
            "wa"
          ],
          "sound": "ワ"
        },
        "o": {
          "jp_character": "ヲ",
          "romanji": [
            "wo"
          ],
          "sound": "ヲ"
        },
        "u": {
          "jp_character": "ン",
          "romanji": [
            "n"
          ]
        }
      }
    },
    "g": {
      "title": "ガ",
      "tags": [
        "dakuten_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "ガ",
          "romanji": [
            "ga"
          ],
          "sound": "ガ"
        },
        "i": {
          "jp_character": "ギ",
          "romanji": [
            "gi"
          ],
          "sound": "ギ"
        },
        "u": {
          "jp_character": "グ",
          "romanji": [
            "gu"
          ],
          "sound": "グ"
        },
        "e": {
          "jp_character": "ゲ",
          "romanji": [
            "ge"
          ],
          "sound": "ゲ"
        },
        "o": {
          "jp_character": "ゴ",
          "romanji": [
            "go"
          ],
          "sound": "ゴ"
        }
      }
    },
    "z": {
      "title": "ザ",
      "tags": [
        "dakuten_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "ザ",
          "romanji": [
            "za"
          ],
          "sound": "ザ"
        },
        "i": {
          "jp_character": "ジ",
          "romanji": [
            "ji"
          ],
          "sound": "ジ"
        },
        "u": {
          "jp_character": "ズ",
          "romanji": [
            "zu"
          ],
          "sound": "ズ"
        },
        "e": {
          "jp_character": "ゼ",
          "romanji": [
            "ze"
          ],
          "sound": "ゼ"
        },
        "o": {
          "jp_character": "ゾ",
          "romanji": [
            "zo"
          ],
          "sound": "ゾ"
        }
      }
    },
    "d": {
      "title": "ダ",
      "tags": [
        "dakuten_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "ダ",
          "romanji": [
            "da"
          ],
          "sound": "ダ"
        },
        "i": {
          "jp_character": "ヂ",
          "romanji": [
            "ji"
          ],
          "sound": "ヂ"
        },
        "u": {
          "jp_character": "ヅ",
          "romanji": [
            "zu"
          ],
          "sound": "ヅ"
        },
        "e": {
          "jp_character": "デ",
          "romanji": [
            "de"
          ],
          "sound": "デ"
        },
        "o": {
          "jp_character": "ド",
          "romanji": [
            "do"
          ],
          "sound": "ド"
        }
      }
    },
    "b": {
      "title": "バ",
      "tags": [
        "dakuten_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "バ",
          "romanji": [
            "ba"
          ],
          "sound": "バ"
        },
        "i": {
          "jp_character": "ビ",
          "romanji": [
            "bi"
          ],
          "sound": "ビ"
        },
        "u": {
          "jp_character": "ブ",
          "romanji": [
            "bu"
          ],
          "sound": "ブ"
        },
        "e": {
          "jp_character": "ベ",
          "romanji": [
            "be"
          ],
          "sound": "ベ"
        },
        "o": {
          "jp_character": "ボ",
          "romanji": [
            "bo"
          ],
          "sound": "ボ"
        }
      }
    },
    "p": {
      "title": "パ",
      "tags": [
        "dakuten_kana"
      ],
      "characters": {
        "a": {
          "jp_character": "パ",
          "romanji": [
            "pa"
          ],
          "sound": "パ"
        },
        "i": {
          "jp_character": "ピ",
          "romanji": [
            "pi"
          ],
          "sound": "ピ"
        },
        "u": {
          "jp_character": "プ",
          "romanji": [
            "pu"
          ],
          "sound": "プ"
        },
        "e": {
          "jp_character": "ペ",
          "romanji": [
            "pe"
          ],
          "sound": "ペ"
        },
        "o": {
          "jp_character": "ポ",
          "romanji": [
            "po"
          ],
          "sound": "ポ"
        }
      }
    }
  },
  "words": {
    "kawaii": {
      "jp_character": "かわいい",
      "romanji": [
        "kawaii"
      ],
      "sound": "かわいい",
      "meaning": "cute",
      "meaning_id": "imut",
      "tags": ["adjectives", "expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "あ",
        "か"
      ]
    },
    "jouzu": {
      "jp_character": "じょうず",
      "romanji": [
        "jouzu"
      ],
      "sound": "じょうず",
      "meaning": "skillful",
      "meaning_id": "pandai",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "ざ"
      ]
    },
    "taberu": {
      "jp_character": "たべる",
      "romanji": [
        "taberu"
      ],
      "sound": "たべる",
      "meaning": "to eat",
      "meaning_id": "makan",
      "tags": ["verbs", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "ば",
        "た"
      ]
    },
    "nomu": {
      "jp_character": "のむ",
      "romanji": [
        "nomu"
      ],
      "sound": "のむ",
      "meaning": "to drink",
      "meaning_id": "minum",
      "tags": ["verbs", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "な"
      ]
    },
    "kurasu": {
      "jp_character": "くらす",
      "romanji": [
        "kurasu"
      ],
      "sound": "くらす",
      "meaning": "to live",
      "meaning_id": "hidup / tinggal",
      "tags": ["verbs", "daily_life"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "か",
        "さ"
      ]
    },
    "benkyou": {
      "jp_character": "べんきょう",
      "romanji": [
        "benkyou"
      ],
      "sound": "べんきょう",
      "meaning": "study",
      "meaning_id": "belajar",
      "tags": ["basic"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ば",
        "や",
        "あ",
        "か",
        "わ"
      ]
    },
    "koko": {
      "jp_character": "ここ",
      "romanji": [
        "koko"
      ],
      "sound": "ここ",
      "meaning": "here",
      "meaning_id": "di sini",
      "tags": ["demonstratives", "locations"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か"
      ]
    },
    "soko": {
      "jp_character": "そこ",
      "romanji": [
        "soko"
      ],
      "sound": "そこ",
      "meaning": "there",
      "meaning_id": "di situ",
      "tags": ["demonstratives", "locations"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "さ"
      ]
    },
    "asoko": {
      "jp_character": "あそこ",
      "romanji": [
        "asoko"
      ],
      "sound": "あそこ",
      "meaning": "over there",
      "meaning_id": "di sana",
      "tags": ["demonstratives", "locations"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "さ"
      ]
    },
    "nani": {
      "jp_character": "なに",
      "romanji": [
        "nani"
      ],
      "sound": "なに",
      "meaning": "what",
      "meaning_id": "apa",
      "tags": ["question_words"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な"
      ]
    },
    "doko": {
      "jp_character": "どこ",
      "romanji": [
        "doko"
      ],
      "sound": "どこ",
      "meaning": "where",
      "meaning_id": "di mana",
      "tags": ["question_words"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "だ"
      ]
    },
    "itsu": {
      "jp_character": "いつ",
      "romanji": [
        "itsu"
      ],
      "sound": "いつ",
      "meaning": "when",
      "meaning_id": "kapan",
      "tags": ["question_words"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "た"
      ]
    },
    "dare": {
      "jp_character": "だれ",
      "romanji": [
        "dare"
      ],
      "sound": "だれ",
      "meaning": "who",
      "meaning_id": "siapa",
      "tags": ["question_words"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "だ"
      ]
    },
    "wareware": {
      "jp_character": "われわれ",
      "romanji": [
        "wareware"
      ],
      "sound": "われわれ",
      "meaning": "we",
      "meaning_id": "kami",
      "tags": ["pronouns", "people"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "ら"
      ]
    },
    "anata": {
      "jp_character": "あなた",
      "romanji": [
        "anata"
      ],
      "sound": "あなた",
      "meaning": "you",
      "meaning_id": "kamu",
      "tags": ["pronouns", "people"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "た",
        "な"
      ]
    },
    "kare": {
      "jp_character": "かれ",
      "romanji": [
        "kare"
      ],
      "sound": "かれ",
      "meaning": "he",
      "meaning_id": "dia (laki-laki)",
      "tags": ["pronouns", "people"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "か"
      ]
    },
    "kanojo": {
      "jp_character": "かのじょ",
      "romanji": [
        "kanojo"
      ],
      "sound": "かのじょ",
      "meaning": "she",
      "meaning_id": "dia (perempuan)",
      "tags": ["pronouns", "people"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "か",
        "ざ",
        "な"
      ]
    },
    "sore": {
      "jp_character": "それ",
      "romanji": [
        "sore"
      ],
      "sound": "それ",
      "meaning": "that",
      "meaning_id": "itu",
      "tags": ["demonstratives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "さ"
      ]
    },
    "kore": {
      "jp_character": "これ",
      "romanji": [
        "kore"
      ],
      "sound": "これ",
      "meaning": "this",
      "meaning_id": "ini",
      "tags": ["demonstratives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "か"
      ]
    },
    "kono": {
      "jp_character": "この",
      "romanji": [
        "kono"
      ],
      "sound": "この",
      "meaning": "this",
      "meaning_id": "ini (yang ini)",
      "tags": ["demonstratives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "な"
      ]
    },
    "sono": {
      "jp_character": "その",
      "romanji": [
        "sono"
      ],
      "sound": "その",
      "meaning": "that",
      "meaning_id": "itu (yang itu)",
      "tags": ["demonstratives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "な"
      ]
    },
    "ano": {
      "jp_character": "あの",
      "romanji": [
        "ano"
      ],
      "sound": "あの",
      "meaning": "that over there",
      "meaning_id": "itu (yang di sana)",
      "tags": ["demonstratives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "な"
      ]
    },
    "ookii": {
      "jp_character": "おおきい",
      "romanji": [
        "ookii"
      ],
      "sound": "おおきい",
      "meaning": "big",
      "meaning_id": "besar",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か"
      ]
    },
    "chiisai": {
      "jp_character": "ちいさい",
      "romanji": [
        "chiisai"
      ],
      "sound": "ちいさい",
      "meaning": "small",
      "meaning_id": "kecil",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ",
        "た"
      ]
    },
    "samui": {
      "jp_character": "さむい",
      "romanji": [
        "samui"
      ],
      "sound": "さむい",
      "meaning": "cold",
      "meaning_id": "dingin",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "ま",
        "さ"
      ]
    },
    "takai": {
      "jp_character": "たかい",
      "romanji": [
        "takai"
      ],
      "sound": "たかい",
      "meaning": "expensive",
      "meaning_id": "mahal",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "た"
      ]
    },
    "yasui": {
      "jp_character": "やすい",
      "romanji": [
        "yasui"
      ],
      "sound": "やすい",
      "meaning": "cheap",
      "meaning_id": "murah",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "さ"
      ]
    },
    "omoshiroi": {
      "jp_character": "おもしろい",
      "romanji": [
        "omoshiroi"
      ],
      "sound": "おもしろい",
      "meaning": "interesting",
      "meaning_id": "menarik",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ",
        "ま",
        "さ"
      ]
    },
    "tsumaranai": {
      "jp_character": "つまらない",
      "romanji": [
        "tsumaranai"
      ],
      "sound": "つまらない",
      "meaning": "boring",
      "meaning_id": "membosankan",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "た",
        "ら",
        "あ",
        "な"
      ]
    },
    "kantan": {
      "jp_character": "かんたん",
      "romanji": [
        "kantan"
      ],
      "sound": "かんたん",
      "meaning": "easy",
      "meaning_id": "mudah",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "か",
        "た"
      ]
    },
    "muzukashii": {
      "jp_character": "むずかしい",
      "romanji": [
        "muzukashii"
      ],
      "sound": "むずかしい",
      "meaning": "difficult",
      "meaning_id": "sulit",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "ざ",
        "あ",
        "か",
        "さ"
      ]
    },
    "kiken": {
      "jp_character": "きけん",
      "romanji": [
        "kiken"
      ],
      "sound": "きけん",
      "meaning": "dangerous",
      "meaning_id": "berbahaya",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "か"
      ]
    },
    "yasashii": {
      "jp_character": "やさしい",
      "romanji": [
        "yasashii"
      ],
      "sound": "やさしい",
      "meaning": "kind",
      "meaning_id": "baik hati",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "さ"
      ]
    },
    "kirai": {
      "jp_character": "きらい",
      "romanji": [
        "kirai"
      ],
      "sound": "きらい",
      "meaning": "hate",
      "meaning_id": "benci",
      "tags": ["feelings", "adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ",
        "か"
      ]
    },
    "suki": {
      "jp_character": "すき",
      "romanji": [
        "suki"
      ],
      "sound": "すき",
      "meaning": "love",
      "meaning_id": "suka",
      "tags": ["feelings", "adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "さ"
      ]
    },
    "tanoshii": {
      "jp_character": "たのしい",
      "romanji": [
        "tanoshii"
      ],
      "sound": "たのしい",
      "meaning": "pleasant",
      "meaning_id": "menyenangkan",
      "tags": ["feelings", "adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ",
        "た",
        "な"
      ]
    },
    "kanashii": {
      "jp_character": "かなしい",
      "romanji": [
        "kanashii"
      ],
      "sound": "かなしい",
      "meaning": "sad",
      "meaning_id": "sedih",
      "tags": ["feelings", "adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "さ",
        "な"
      ]
    },
    "ureshii": {
      "jp_character": "うれしい",
      "romanji": [
        "ureshii"
      ],
      "sound": "うれしい",
      "meaning": "happy",
      "meaning_id": "senang",
      "tags": ["feelings", "adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ",
        "さ"
      ]
    },
    "kanpai": {
      "jp_character": "かんぱい",
      "romanji": [
        "kanpai"
      ],
      "sound": "かんぱい",
      "meaning": "cheers",
      "meaning_id": "bersulang",
      "tags": ["expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "ぱ",
        "あ",
        "か"
      ]
    },
    "karaoke": {
      "jp_character": "カラオケ",
      "romanji": [
        "karaoke"
      ],
      "sound": "カラオケ",
      "meaning": "karaoke",
      "meaning_id": "karaoke",
      "tags": ["entertainment", "social"],
      "katakana_groups": [
        "ラ",
        "ア",
        "カ"
      ],
      "hiragana_groups": []
    },
    "konbini": {
      "jp_character": "コンビニ",
      "romanji": [
        "konbini"
      ],
      "sound": "コンビニ",
      "meaning": "convenience store",
      "meaning_id": "minimarket",
      "tags": ["places", "shopping"],
      "katakana_groups": [
        "バ",
        "ナ",
        "ワ",
        "カ"
      ],
      "hiragana_groups": []
    },
    "pasokon": {
      "jp_character": "パソコン",
      "romanji": [
        "pasokon"
      ],
      "sound": "パソコン",
      "meaning": "computer",
      "meaning_id": "komputer",
      "tags": ["items", "technology"],
      "katakana_groups": [
        "サ",
        "ワ",
        "カ",
        "パ"
      ],
      "hiragana_groups": []
    },
    "supootsu": {
      "jp_character": "スポーツ",
      "romanji": [
        "supootsu"
      ],
      "sound": "スポーツ",
      "meaning": "sports",
      "meaning_id": "olahraga",
      "tags": ["activities", "hobbies"],
      "katakana_groups": [
        "サ",
        "タ",
        "パ"
      ],
      "hiragana_groups": []
    },
    "rajio": {
      "jp_character": "ラジオ",
      "romanji": [
        "rajio"
      ],
      "sound": "ラジオ",
      "meaning": "radio",
      "meaning_id": "radio",
      "tags": ["items", "technology"],
      "katakana_groups": [
        "ザ",
        "ラ",
        "ア"
      ],
      "hiragana_groups": []
    },
    "tegami": {
      "jp_character": "てがみ",
      "romanji": [
        "tegami"
      ],
      "sound": "てがみ",
      "meaning": "letter",
      "meaning_id": "surat",
      "tags": ["items", "communication"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "た",
        "が"
      ]
    },
    "pasu-poto": {
      "jp_character": "パスポート",
      "romanji": [
        "pasu-poto",
        "pasupooto"
      ],
      "sound": "パスポート",
      "meaning": "passport",
      "meaning_id": "paspor",
      "tags": ["items", "travel"],
      "katakana_groups": [
        "サ",
        "タ",
        "パ"
      ],
      "hiragana_groups": []
    },
    "biiru": {
      "jp_character": "ビール",
      "romanji": [
        "biiru"
      ],
      "sound": "ビール",
      "meaning": "beer",
      "meaning_id": "bir",
      "tags": ["food", "drinks"],
      "katakana_groups": [
        "バ",
        "ラ"
      ],
      "hiragana_groups": []
    },
    "ko-hi-": {
      "jp_character": "コーヒー",
      "romanji": [
        "ko-hi-",
        "koohii"
      ],
      "sound": "コーヒー",
      "meaning": "coffee",
      "meaning_id": "kopi",
      "tags": ["food", "drinks"],
      "katakana_groups": [
        "ハ",
        "カ"
      ],
      "hiragana_groups": []
    },
    "mizu": {
      "jp_character": "みず",
      "romanji": [
        "mizu"
      ],
      "sound": "みず",
      "meaning": "water",
      "meaning_id": "air",
      "tags": ["food", "drinks"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "ざ"
      ]
    },
    "bi-do": {
      "jp_character": "ビード",
      "romanji": [
        "bi-do",
        "biido"
      ],
      "sound": "ビード",
      "meaning": "beard",
      "meaning_id": "jenggot",
      "tags": ["basic"],
      "katakana_groups": [
        "バ",
        "ダ"
      ],
      "hiragana_groups": []
    },
    "miruku": {
      "jp_character": "ミルク",
      "romanji": [
        "miruku"
      ],
      "sound": "ミルク",
      "meaning": "milk",
      "meaning_id": "susu",
      "tags": ["food", "drinks"],
      "katakana_groups": [
        "マ",
        "ラ",
        "カ"
      ],
      "hiragana_groups": []
    },
    "pan": {
      "jp_character": "パン",
      "romanji": [
        "pan"
      ],
      "sound": "パン",
      "meaning": "bread",
      "meaning_id": "roti",
      "tags": ["food"],
      "katakana_groups": [
        "ワ",
        "パ"
      ],
      "hiragana_groups": []
    },
    "nihongo": {
      "jp_character": "にほんご",
      "romanji": [
        "nihongo"
      ],
      "sound": "にほんご",
      "meaning": "Japanese language",
      "meaning_id": "bahasa Jepang",
      "tags": ["languages", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "は",
        "な",
        "が"
      ]
    },
    "suika": {
      "jp_character": "すいか",
      "romanji": [
        "suika"
      ],
      "sound": "すいか",
      "meaning": "watermelon",
      "meaning_id": "semangka",
      "tags": ["food", "drinks"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "さ"
      ]
    },
    "ringo": {
      "jp_character": "りんご",
      "romanji": [
        "ringo"
      ],
      "sound": "りんご",
      "meaning": "apple",
      "meaning_id": "apel",
      "tags": ["food", "fruits"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "ら",
        "が"
      ]
    },
    "mikan": {
      "jp_character": "みかん",
      "romanji": [
        "mikan"
      ],
      "sound": "みかん",
      "meaning": "mandarin",
      "meaning_id": "jeruk mandarin",
      "tags": ["food", "fruits"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "ま",
        "か"
      ]
    },
    "tomato": {
      "jp_character": "トマト",
      "romanji": [
        "tomato"
      ],
      "sound": "トマト",
      "meaning": "tomato",
      "meaning_id": "tomat",
      "tags": ["food", "vegetables"],
      "katakana_groups": [
        "マ",
        "タ"
      ],
      "hiragana_groups": []
    },
    "sushi": {
      "jp_character": "すし",
      "romanji": [
        "sushi"
      ],
      "sound": "すし",
      "meaning": "sushi",
      "meaning_id": "sushi",
      "tags": ["food", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ"
      ]
    },
    "ramen": {
      "jp_character": "ラーメン",
      "romanji": [
        "ramen",
        "raamen"
      ],
      "sound": "ラーメン",
      "meaning": "ramen",
      "meaning_id": "ramen",
      "tags": ["food", "japanese_culture"],
      "katakana_groups": [
        "マ",
        "ラ",
        "ワ"
      ],
      "hiragana_groups": []
    },
    "udon": {
      "jp_character": "うどん",
      "romanji": [
        "udon"
      ],
      "sound": "うどん",
      "meaning": "udon noodles",
      "meaning_id": "mi udon",
      "tags": ["food", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "あ",
        "だ"
      ]
    },
    "soba": {
      "jp_character": "そば",
      "romanji": [
        "soba"
      ],
      "sound": "そば",
      "meaning": "soba noodles",
      "meaning_id": "mi soba",
      "tags": ["food", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ば",
        "さ"
      ]
    },
    "karee raisu": {
      "jp_character": "カレーライス",
      "romanji": [
        "karee raisu",
        "kareeraisu"
      ],
      "sound": "カレーライス",
      "meaning": "curry rice",
      "meaning_id": "nasi kari",
      "tags": ["basic"],
      "katakana_groups": [
        "サ",
        "ラ",
        "ア",
        "カ"
      ],
      "hiragana_groups": []
    },
    "yasai": {
      "jp_character": "やさい",
      "romanji": [
        "yasai"
      ],
      "sound": "やさい",
      "meaning": "vegetable",
      "meaning_id": "sayuran",
      "tags": ["food", "vegetables"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "さ"
      ]
    },
    "tamago": {
      "jp_character": "たまご",
      "romanji": [
        "tamago"
      ],
      "sound": "たまご",
      "meaning": "egg",
      "meaning_id": "telur",
      "tags": ["food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "た",
        "が"
      ]
    },
    "kudamono": {
      "jp_character": "くだもの",
      "romanji": [
        "kudamono"
      ],
      "sound": "くだもの",
      "meaning": "fruit",
      "meaning_id": "buah",
      "tags": ["food", "fruits"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "か",
        "だ",
        "な"
      ]
    },
    "okashi": {
      "jp_character": "おかし",
      "romanji": [
        "okashi"
      ],
      "sound": "おかし",
      "meaning": "candy",
      "meaning_id": "camilan / permen",
      "tags": ["food", "sweets"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "さ"
      ]
    },
    "keeki": {
      "jp_character": "ケーキ",
      "romanji": [
        "keeki"
      ],
      "sound": "ケーキ",
      "meaning": "cake",
      "meaning_id": "kue",
      "tags": ["food", "sweets"],
      "katakana_groups": [
        "カ"
      ],
      "hiragana_groups": []
    },
    "aisukurimu": {
      "jp_character": "アイスクリーム",
      "romanji": [
        "aisukurimu",
        "aisukuriimu"
      ],
      "sound": "アイスクリーム",
      "meaning": "ice cream",
      "meaning_id": "es krim",
      "tags": ["food", "sweets"],
      "katakana_groups": [
        "ラ",
        "カ",
        "マ",
        "サ",
        "ア"
      ],
      "hiragana_groups": []
    },
    "misoshiru": {
      "jp_character": "みそしる",
      "romanji": [
        "misoshiru"
      ],
      "sound": "みそしる",
      "meaning": "miso soup",
      "meaning_id": "sup miso",
      "tags": ["food", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "ま",
        "さ"
      ]
    },
    "tonjiru": {
      "jp_character": "とんじる",
      "romanji": [
        "tonjiru"
      ],
      "sound": "とんじる",
      "meaning": "pork miso soup",
      "meaning_id": "sup miso babi",
      "tags": ["food", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "ら",
        "た",
        "ざ"
      ]
    },
    "suupu": {
      "jp_character": "スープ",
      "romanji": [
        "suupu"
      ],
      "sound": "スープ",
      "meaning": "soup",
      "meaning_id": "sup",
      "tags": ["food"],
      "katakana_groups": [
        "サ",
        "パ"
      ],
      "hiragana_groups": []
    },
    "pasta": {
      "jp_character": "パスタ",
      "romanji": [
        "pasta",
        "pasuta"
      ],
      "sound": "パスタ",
      "meaning": "pasta",
      "meaning_id": "pasta",
      "tags": ["food"],
      "katakana_groups": [
        "サ",
        "タ",
        "パ"
      ],
      "hiragana_groups": []
    },
    "omuretsu": {
      "jp_character": "オムレツ",
      "romanji": [
        "omuretsu"
      ],
      "sound": "オムレツ",
      "meaning": "omelette",
      "meaning_id": "omelet",
      "tags": ["food"],
      "katakana_groups": [
        "マ",
        "ラ",
        "タ",
        "ア"
      ],
      "hiragana_groups": []
    },
    "nudoru": {
      "jp_character": "ヌードル",
      "romanji": [
        "nudoru",
        "nuudoru"
      ],
      "sound": "ヌードル",
      "meaning": "noodles",
      "meaning_id": "mi",
      "tags": ["food"],
      "katakana_groups": [
        "ナ",
        "ダ",
        "ラ"
      ],
      "hiragana_groups": []
    },
    "gyuudon": {
      "jp_character": "ぎゅうどん",
      "romanji": [
        "gyuudon",
        "gyudon"
      ],
      "sound": "ぎゅうどん",
      "meaning": "beef bowl",
      "meaning_id": "nasi daging sapi",
      "tags": ["food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "だ",
        "や",
        "あ",
        "わ",
        "が"
      ]
    },
    "katsudon": {
      "jp_character": "かつどん",
      "romanji": [
        "katsudon"
      ],
      "sound": "かつどん",
      "meaning": "pork cutlet bowl",
      "meaning_id": "nasi katsu babi",
      "tags": ["food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "か",
        "だ",
        "た"
      ]
    },
    "tempura": {
      "jp_character": "てんぷら",
      "romanji": [
        "tempura",
        "tenpura"
      ],
      "sound": "てんぷら",
      "meaning": "tempura",
      "meaning_id": "tempura",
      "tags": ["food", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "ぱ",
        "ら",
        "た"
      ]
    },
    "tendon": {
      "jp_character": "てんどん",
      "romanji": [
        "tendon"
      ],
      "sound": "てんどん",
      "meaning": "tempura bowl",
      "meaning_id": "nasi tempura",
      "tags": ["food", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "だ",
        "た"
      ]
    },
    "ebifurai": {
      "jp_character": "えびふらい",
      "romanji": [
        "ebifurai"
      ],
      "sound": "えびふらい",
      "meaning": "fried shrimp",
      "meaning_id": "udang goreng",
      "tags": ["food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ば",
        "あ",
        "ら",
        "は"
      ]
    },
    "sasakama": {
      "jp_character": "ささかま",
      "romanji": [
        "sasakama"
      ],
      "sound": "ささかま",
      "meaning": "fish cake",
      "meaning_id": "kue ikan",
      "tags": ["food", "sweets"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "か",
        "さ"
      ]
    },
    "yakisoba": {
      "jp_character": "やきそば",
      "romanji": [
        "yakisoba"
      ],
      "sound": "やきそば",
      "meaning": "fried noodles",
      "meaning_id": "mi goreng",
      "tags": ["food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ば",
        "か",
        "さ"
      ]
    },
    "yakitori": {
      "jp_character": "やきとり",
      "romanji": [
        "yakitori"
      ],
      "sound": "やきとり",
      "meaning": "grilled chicken",
      "meaning_id": "sate ayam",
      "tags": ["food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ら",
        "か",
        "た"
      ]
    },
    "okonomiyaki": {
      "jp_character": "おこのみやき",
      "romanji": [
        "okonomiyaki"
      ],
      "sound": "おこのみやき",
      "meaning": "savory pancake",
      "meaning_id": "okonomiyaki (pancake gurih)",
      "tags": ["food", "sweets"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "や",
        "あ",
        "か",
        "な"
      ]
    },
    "mitsu": {
      "jp_character": "みつ",
      "romanji": [
        "mitsu"
      ],
      "sound": "みつ",
      "meaning": "honey",
      "meaning_id": "madu",
      "tags": ["food", "sweets"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "た"
      ]
    },
    "ankooru": {
      "jp_character": "アンコール",
      "romanji": [
        "ankooru"
      ],
      "sound": "アンコール",
      "meaning": "encore",
      "meaning_id": "encore",
      "tags": ["entertainment", "music"],
      "katakana_groups": [
        "ワ",
        "カ",
        "ラ",
        "ア"
      ],
      "hiragana_groups": []
    },
    "ramune": {
      "jp_character": "ラムネ",
      "romanji": [
        "ramune"
      ],
      "sound": "ラムネ",
      "meaning": "Ramune (soda)",
      "meaning_id": "Ramune (soda)",
      "tags": ["food", "drinks"],
      "katakana_groups": [
        "ナ",
        "マ",
        "ラ"
      ],
      "hiragana_groups": []
    },
    "biru": {
      "jp_character": "ビル",
      "romanji": [
        "biru"
      ],
      "sound": "ビル",
      "meaning": "building",
      "meaning_id": "gedung",
      "tags": ["places", "buildings"],
      "katakana_groups": [
        "バ",
        "ラ"
      ],
      "hiragana_groups": []
    },
    "tougarashi": {
      "jp_character": "とうがらし",
      "romanji": [
        "tougarashi"
      ],
      "sound": "とうがらし",
      "meaning": "chili pepper",
      "meaning_id": "cabai",
      "tags": ["food", "vegetables"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "ら",
        "あ",
        "さ",
        "が"
      ]
    },
    "shio": {
      "jp_character": "しお",
      "romanji": [
        "shio"
      ],
      "sound": "しお",
      "meaning": "salt",
      "meaning_id": "garam",
      "tags": ["food", "condiments"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ"
      ]
    },
    "koshou": {
      "jp_character": "こしょう",
      "romanji": [
        "koshou"
      ],
      "sound": "こしょう",
      "meaning": "black pepper",
      "meaning_id": "lada hitam",
      "tags": ["food", "vegetables"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "か",
        "さ"
      ]
    },
    "shouyu": {
      "jp_character": "しょうゆ",
      "romanji": [
        "shouyu"
      ],
      "sound": "しょうゆ",
      "meaning": "soy sauce",
      "meaning_id": "kecap asin",
      "tags": ["food", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "さ"
      ]
    },
    "tonkatsu sosu": {
      "jp_character": "とんかつソース",
      "romanji": [
        "tonkatsu sosu",
        "tonkatsusoosu"
      ],
      "sound": "とんかつソース",
      "meaning": "tonkatsu sauce",
      "meaning_id": "saus tonkatsu",
      "tags": ["food", "condiments"],
      "katakana_groups": [
        "サ"
      ],
      "hiragana_groups": [
        "わ",
        "か",
        "た"
      ]
    },
    "mayone-zu": {
      "jp_character": "マヨネーズ",
      "romanji": [
        "mayone-zu",
        "mayoneezu"
      ],
      "sound": "マヨネーズ",
      "meaning": "mayonnaise",
      "meaning_id": "mayones",
      "tags": ["food", "condiments"],
      "katakana_groups": [
        "ナ",
        "ザ",
        "マ",
        "ヤ"
      ],
      "hiragana_groups": []
    },
    "karashi": {
      "jp_character": "からし",
      "romanji": [
        "karashi"
      ],
      "sound": "からし",
      "meaning": "mustard",
      "meaning_id": "mustar",
      "tags": ["food", "condiments"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "か",
        "さ"
      ]
    },
    "wasabi": {
      "jp_character": "わさび",
      "romanji": [
        "wasabi"
      ],
      "sound": "わさび",
      "meaning": "wasabi",
      "meaning_id": "wasabi",
      "tags": ["food", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "ば",
        "さ"
      ]
    },
    "kabocha": {
      "jp_character": "かぼちゃ",
      "romanji": [
        "kabocha"
      ],
      "sound": "かぼちゃ",
      "meaning": "pumpkin",
      "meaning_id": "labu",
      "tags": ["food", "vegetables"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ば",
        "か",
        "た"
      ]
    },
    "nasu": {
      "jp_character": "なす",
      "romanji": [
        "nasu"
      ],
      "sound": "なす",
      "meaning": "eggplant",
      "meaning_id": "terong",
      "tags": ["food", "vegetables"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "な"
      ]
    },
    "pi-man": {
      "jp_character": "ピーマン",
      "romanji": [
        "pi-man",
        "piiman"
      ],
      "sound": "ピーマン",
      "meaning": "green pepper",
      "meaning_id": "paprika hijau",
      "tags": ["food", "vegetables"],
      "katakana_groups": [
        "マ",
        "ワ",
        "パ"
      ],
      "hiragana_groups": []
    },
    "papurika": {
      "jp_character": "パプリカ",
      "romanji": [
        "papurika"
      ],
      "sound": "パプリカ",
      "meaning": "bell pepper",
      "meaning_id": "paprika",
      "tags": ["food", "vegetables"],
      "katakana_groups": [
        "カ",
        "ラ",
        "パ"
      ],
      "hiragana_groups": []
    },
    "rena": {
      "jp_character": "レナ",
      "romanji": [
        "rena"
      ],
      "sound": "レナ",
      "meaning": "lettuce",
      "meaning_id": "selada",
      "tags": ["food", "vegetables"],
      "katakana_groups": [
        "ナ",
        "ラ"
      ],
      "hiragana_groups": []
    },
    "bacon": {
      "jp_character": "ベーコン",
      "romanji": [
        "bacon",
        "beekon"
      ],
      "sound": "ベーコン",
      "meaning": "bacon",
      "meaning_id": "bacon",
      "tags": ["food", "meat"],
      "katakana_groups": [
        "バ",
        "ワ",
        "カ"
      ],
      "hiragana_groups": []
    },
    "hamu": {
      "jp_character": "ハム",
      "romanji": [
        "hamu"
      ],
      "sound": "ハム",
      "meaning": "ham",
      "meaning_id": "ham",
      "tags": ["food", "meat"],
      "katakana_groups": [
        "マ",
        "ハ"
      ],
      "hiragana_groups": []
    },
    "chiken": {
      "jp_character": "チキン",
      "romanji": [
        "chiken",
        "chikin"
      ],
      "sound": "チキン",
      "meaning": "chicken",
      "meaning_id": "ayam",
      "tags": ["food"],
      "katakana_groups": [
        "ワ",
        "タ",
        "カ"
      ],
      "hiragana_groups": []
    },
    "nan": {
      "jp_character": "パン",
      "romanji": [
        "nan",
        "pan"
      ],
      "sound": "パン",
      "meaning": "bread",
      "meaning_id": "roti",
      "tags": ["food"],
      "katakana_groups": [
        "ワ",
        "パ"
      ],
      "hiragana_groups": []
    },
    "piza": {
      "jp_character": "ピザ",
      "romanji": [
        "piza"
      ],
      "sound": "ピザ",
      "meaning": "pizza",
      "meaning_id": "pizza",
      "tags": ["food"],
      "katakana_groups": [
        "ザ",
        "パ"
      ],
      "hiragana_groups": []
    },
    "pasuta": {
      "jp_character": "パスタ",
      "romanji": [
        "pasuta"
      ],
      "sound": "パスタ",
      "meaning": "pasta",
      "meaning_id": "pasta",
      "tags": ["food"],
      "katakana_groups": [
        "サ",
        "タ",
        "パ"
      ],
      "hiragana_groups": []
    },
    "akachan": {
      "jp_character": "あかちゃん",
      "romanji": [
        "akachan"
      ],
      "sound": "あかちゃん",
      "meaning": "baby",
      "meaning_id": "bayi",
      "tags": ["people", "family"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "や",
        "あ",
        "か",
        "わ"
      ]
    },
    "akai": {
      "jp_character": "あかい",
      "romanji": [
        "akai"
      ],
      "sound": "あかい",
      "meaning": "red",
      "meaning_id": "merah",
      "tags": ["colors", "adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か"
      ]
    },
    "akarui": {
      "jp_character": "あかるい",
      "romanji": [
        "akarui"
      ],
      "sound": "あかるい",
      "meaning": "bright",
      "meaning_id": "terang",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ",
        "か"
      ]
    },
    "arigatou": {
      "jp_character": "ありがとう",
      "romanji": [
        "arigatou"
      ],
      "sound": "ありがとう",
      "meaning": "thank you",
      "meaning_id": "terima kasih",
      "tags": ["expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ",
        "た",
        "が"
      ]
    },
    "banana": {
      "jp_character": "バナナ",
      "romanji": [
        "banana"
      ],
      "sound": "バナナ",
      "meaning": "banana",
      "meaning_id": "pisang",
      "tags": ["food", "fruits"],
      "katakana_groups": [
        "バ",
        "ナ"
      ],
      "hiragana_groups": []
    },
    "bikkuri": {
      "jp_character": "びっくり",
      "romanji": [
        "bikkuri"
      ],
      "sound": "びっくり",
      "meaning": "surprise",
      "meaning_id": "kaget",
      "tags": ["feelings", "expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "ば",
        "か",
        "た"
      ]
    },
    "bosu": {
      "jp_character": "ボス",
      "romanji": [
        "bosu"
      ],
      "sound": "ボス",
      "meaning": "boss",
      "meaning_id": "bos",
      "tags": ["people", "work"],
      "katakana_groups": [
        "バ",
        "サ"
      ],
      "hiragana_groups": []
    },
    "burokkori": {
      "jp_character": "ぶろっこり",
      "romanji": [
        "burokkori"
      ],
      "sound": "ぶろっこり",
      "meaning": "plump",
      "meaning_id": "brokoli",
      "tags": ["basic"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "ば",
        "か",
        "た"
      ]
    },
    "busu": {
      "jp_character": "ブス",
      "romanji": [
        "busu"
      ],
      "sound": "ブス",
      "meaning": "ugly",
      "meaning_id": "jelek",
      "tags": ["adjectives", "appearance"],
      "katakana_groups": [
        "バ",
        "サ"
      ],
      "hiragana_groups": []
    },
    "byouin": {
      "jp_character": "びょういん",
      "romanji": [
        "byouin"
      ],
      "sound": "びょういん",
      "meaning": "hospital",
      "meaning_id": "rumah sakit",
      "tags": ["places", "health"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ば",
        "わ",
        "あ"
      ]
    },
    "cha": {
      "jp_character": "ちゃ",
      "romanji": [
        "cha"
      ],
      "sound": "ちゃ",
      "meaning": "tea",
      "meaning_id": "teh",
      "tags": ["food", "drinks"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "た"
      ]
    },
    "chotto": {
      "jp_character": "ちょっと",
      "romanji": [
        "chotto"
      ],
      "sound": "ちょっと",
      "meaning": "a little",
      "meaning_id": "sedikit",
      "tags": ["adverbs", "expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "た"
      ]
    },
    "densha": {
      "jp_character": "でんしゃ",
      "romanji": [
        "densha"
      ],
      "sound": "でんしゃ",
      "meaning": "train",
      "meaning_id": "kereta",
      "tags": ["transportation"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "や",
        "だ",
        "さ"
      ]
    },
    "doa": {
      "jp_character": "ドア",
      "romanji": [
        "doa"
      ],
      "sound": "ドア",
      "meaning": "door",
      "meaning_id": "pintu",
      "tags": ["home", "items"],
      "katakana_groups": [
        "ダ",
        "ア"
      ],
      "hiragana_groups": []
    },
    "dokodemo": {
      "jp_character": "どこでも",
      "romanji": [
        "dokodemo"
      ],
      "sound": "どこでも",
      "meaning": "anywhere",
      "meaning_id": "di mana saja",
      "tags": ["question_words"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "か",
        "だ"
      ]
    },
    "dore": {
      "jp_character": "どれ",
      "romanji": [
        "dore"
      ],
      "sound": "どれ",
      "meaning": "which one",
      "meaning_id": "yang mana",
      "tags": ["question_words"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "だ"
      ]
    },
    "e": {
      "jp_character": "え",
      "romanji": [
        "e"
      ],
      "sound": "え",
      "meaning": "picture",
      "meaning_id": "gambar",
      "tags": ["basic"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ"
      ]
    },
    "fuyu": {
      "jp_character": "ふゆ",
      "romanji": [
        "fuyu"
      ],
      "sound": "ふゆ",
      "meaning": "winter",
      "meaning_id": "musim dingin",
      "tags": ["seasons", "time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "は"
      ]
    },
    "ginkou": {
      "jp_character": "ぎんこう",
      "romanji": [
        "ginkou"
      ],
      "sound": "ぎんこう",
      "meaning": "bank",
      "meaning_id": "bank",
      "tags": ["places", "money"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "あ",
        "か",
        "が"
      ]
    },
    "gomen": {
      "jp_character": "ごめん",
      "romanji": [
        "gomen"
      ],
      "sound": "ごめん",
      "meaning": "sorry",
      "meaning_id": "maaf",
      "tags": ["expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "ま",
        "が"
      ]
    },
    "ha": {
      "jp_character": "は",
      "romanji": [
        "ha"
      ],
      "sound": "は",
      "meaning": "tooth",
      "meaning_id": "gigi",
      "tags": ["body_parts"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は"
      ]
    },
    "hai": {
      "jp_character": "はい",
      "romanji": [
        "hai"
      ],
      "sound": "はい",
      "meaning": "yes",
      "meaning_id": "ya",
      "tags": ["expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "は"
      ]
    },
    "haru": {
      "jp_character": "はる",
      "romanji": [
        "haru"
      ],
      "sound": "はる",
      "meaning": "spring",
      "meaning_id": "musim semi",
      "tags": ["seasons", "time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "は"
      ]
    },
    "hashi": {
      "jp_character": "はし",
      "romanji": [
        "hashi"
      ],
      "sound": "はし",
      "meaning": "chopsticks",
      "meaning_id": "sumpit",
      "tags": ["items", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "は"
      ]
    },
    "hikouki": {
      "jp_character": "ひこうき",
      "romanji": [
        "hikouki"
      ],
      "sound": "ひこうき",
      "meaning": "airplane",
      "meaning_id": "pesawat",
      "tags": ["transportation"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "は"
      ]
    },
    "himawari": {
      "jp_character": "ひまわり",
      "romanji": [
        "himawari"
      ],
      "sound": "ひまわり",
      "meaning": "sunflower",
      "meaning_id": "bunga matahari",
      "tags": ["nature", "flowers"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "ら",
        "ま",
        "は"
      ]
    },
    "ii": {
      "jp_character": "いい",
      "romanji": [
        "ii"
      ],
      "sound": "いい",
      "meaning": "good",
      "meaning_id": "bagus",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ"
      ]
    },
    "iie": {
      "jp_character": "いいえ",
      "romanji": [
        "iie"
      ],
      "sound": "いいえ",
      "meaning": "no",
      "meaning_id": "tidak",
      "tags": ["expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ"
      ]
    },
    "oomizu": {
      "jp_character": "おおみず",
      "romanji": [
        "oomizu"
      ],
      "sound": "おおみず",
      "meaning": "water",
      "meaning_id": "banjir",
      "tags": ["food", "drinks"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "ま",
        "ざ"
      ]
    },
    "sake": {
      "jp_character": "さけ",
      "romanji": [
        "sake"
      ],
      "sound": "さけ",
      "meaning": "alcohol",
      "meaning_id": "sake / minuman keras",
      "tags": ["basic"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "さ"
      ]
    },
    "wan": {
      "jp_character": "わん",
      "romanji": [
        "wan"
      ],
      "sound": "わん",
      "meaning": "dog",
      "meaning_id": "anjing (guk)",
      "tags": ["animals", "pets"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ"
      ]
    },
    "neko": {
      "jp_character": "ねこ",
      "romanji": [
        "neko"
      ],
      "sound": "ねこ",
      "meaning": "cat",
      "meaning_id": "kucing",
      "tags": ["animals", "pets"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "な"
      ]
    },
    "tori": {
      "jp_character": "とり",
      "romanji": [
        "tori"
      ],
      "sound": "とり",
      "meaning": "bird",
      "meaning_id": "burung",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "た"
      ]
    },
    "uma": {
      "jp_character": "うま",
      "romanji": [
        "uma"
      ],
      "sound": "うま",
      "meaning": "horse",
      "meaning_id": "kuda",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "ま"
      ]
    },
    "hitsuji": {
      "jp_character": "ひつじ",
      "romanji": [
        "hitsuji"
      ],
      "sound": "ひつじ",
      "meaning": "sheep",
      "meaning_id": "domba",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "は",
        "ざ"
      ]
    },
    "buta": {
      "jp_character": "ぶた",
      "romanji": [
        "buta"
      ],
      "sound": "ぶた",
      "meaning": "pig",
      "meaning_id": "babi",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ば",
        "た"
      ]
    },
    "inoshishi": {
      "jp_character": "いのしし",
      "romanji": [
        "inoshishi"
      ],
      "sound": "いのしし",
      "meaning": "boar",
      "meaning_id": "babi hutan",
      "tags": ["basic"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ",
        "な"
      ]
    },
    "zarigani": {
      "jp_character": "ざりがに",
      "romanji": [
        "zarigani"
      ],
      "sound": "ざりがに",
      "meaning": "crab",
      "meaning_id": "udang karang",
      "tags": ["basic"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "な",
        "ざ",
        "が"
      ]
    },
    "ika": {
      "jp_character": "いか",
      "romanji": [
        "ika"
      ],
      "sound": "いか",
      "meaning": "squid",
      "meaning_id": "cumi-cumi",
      "tags": ["animals", "seafood"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か"
      ]
    },
    "ebi": {
      "jp_character": "えび",
      "romanji": [
        "ebi"
      ],
      "sound": "えび",
      "meaning": "shrimp",
      "meaning_id": "udang",
      "tags": ["food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ば",
        "あ"
      ]
    },
    "momo": {
      "jp_character": "もも",
      "romanji": [
        "momo"
      ],
      "sound": "もも",
      "meaning": "peach",
      "meaning_id": "persik",
      "tags": ["food", "fruits"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま"
      ]
    },
    "budou": {
      "jp_character": "ぶどう",
      "romanji": [
        "budou"
      ],
      "sound": "ぶどう",
      "meaning": "grape",
      "meaning_id": "anggur",
      "tags": ["food", "fruits"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ば",
        "だ",
        "あ"
      ]
    },
    "ichigo": {
      "jp_character": "いちご",
      "romanji": [
        "ichigo"
      ],
      "sound": "いちご",
      "meaning": "strawberry",
      "meaning_id": "stroberi",
      "tags": ["food", "fruits"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "た",
        "が"
      ]
    },
    "kurisumasu": {
      "jp_character": "クリスマス",
      "romanji": [
        "kurisumasu"
      ],
      "sound": "クリスマス",
      "meaning": "Christmas",
      "meaning_id": "Natal",
      "tags": ["events", "holidays"],
      "katakana_groups": [
        "サ",
        "マ",
        "ラ",
        "カ"
      ],
      "hiragana_groups": []
    },
    "hanabi": {
      "jp_character": "はなび",
      "romanji": [
        "hanabi"
      ],
      "sound": "はなび",
      "meaning": "fireworks",
      "meaning_id": "kembang api",
      "tags": ["events", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ば",
        "は",
        "な"
      ]
    },
    "hina": {
      "jp_character": "ひな",
      "romanji": [
        "hina"
      ],
      "sound": "ひな",
      "meaning": "doll",
      "meaning_id": "boneka hina",
      "tags": ["items", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "な"
      ]
    },
    "tanjoubi": {
      "jp_character": "たんじょうび",
      "romanji": [
        "tanjoubi"
      ],
      "sound": "たんじょうび",
      "meaning": "birthday",
      "meaning_id": "ulang tahun",
      "tags": ["events", "celebrations"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ば",
        "た",
        "ざ",
        "や",
        "あ",
        "わ"
      ]
    },
    "kyou": {
      "jp_character": "きょう",
      "romanji": [
        "kyou"
      ],
      "sound": "きょう",
      "meaning": "today",
      "meaning_id": "hari ini",
      "tags": ["time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "か"
      ]
    },
    "ashita": {
      "jp_character": "あした",
      "romanji": [
        "ashita"
      ],
      "sound": "あした",
      "meaning": "tomorrow",
      "meaning_id": "besok",
      "tags": ["time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ",
        "た"
      ]
    },
    "kinou": {
      "jp_character": "きのう",
      "romanji": [
        "kinou"
      ],
      "sound": "きのう",
      "meaning": "yesterday",
      "meaning_id": "kemarin",
      "tags": ["expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "な"
      ]
    },
    "getsuyoubi": {
      "jp_character": "げつようび",
      "romanji": [
        "getsuyoubi"
      ],
      "sound": "げつようび",
      "meaning": "Monday",
      "meaning_id": "Senin",
      "tags": ["time", "days_of_week"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ば",
        "た",
        "や",
        "あ",
        "が"
      ]
    },
    "kayoubi": {
      "jp_character": "かようび",
      "romanji": [
        "kayoubi"
      ],
      "sound": "かようび",
      "meaning": "Tuesday",
      "meaning_id": "Selasa",
      "tags": ["time", "days_of_week"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ば",
        "あ",
        "か"
      ]
    },
    "suiyoubi": {
      "jp_character": "すいようび",
      "romanji": [
        "suiyoubi"
      ],
      "sound": "すいようび",
      "meaning": "Wednesday",
      "meaning_id": "Rabu",
      "tags": ["time", "days_of_week"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ば",
        "あ",
        "さ"
      ]
    },
    "mokuyoubi": {
      "jp_character": "もくようび",
      "romanji": [
        "mokuyoubi"
      ],
      "sound": "もくようび",
      "meaning": "Thursday",
      "meaning_id": "Kamis",
      "tags": ["time", "days_of_week"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ば",
        "ま",
        "や",
        "あ",
        "か"
      ]
    },
    "kinyoubi": {
      "jp_character": "きんようび",
      "romanji": [
        "kinyoubi",
        "kin'youbi"
      ],
      "sound": "きんようび",
      "meaning": "Friday",
      "meaning_id": "Jumat",
      "tags": ["time", "days_of_week"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ば",
        "や",
        "あ",
        "か",
        "わ"
      ]
    },
    "doyoubi": {
      "jp_character": "どようび",
      "romanji": [
        "doyoubi"
      ],
      "sound": "どようび",
      "meaning": "Saturday",
      "meaning_id": "Sabtu",
      "tags": ["time", "days_of_week"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ば",
        "あ",
        "だ"
      ]
    },
    "nichiyoubi": {
      "jp_character": "にちようび",
      "romanji": [
        "nichiyoubi"
      ],
      "sound": "にちようび",
      "meaning": "Sunday",
      "meaning_id": "Minggu",
      "tags": ["time", "days_of_week"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ば",
        "た",
        "や",
        "あ",
        "な"
      ]
    },
    "natsu": {
      "jp_character": "なつ",
      "romanji": [
        "natsu"
      ],
      "sound": "なつ",
      "meaning": "summer",
      "meaning_id": "musim panas",
      "tags": ["seasons", "time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "な"
      ]
    },
    "aki": {
      "jp_character": "あき",
      "romanji": [
        "aki"
      ],
      "sound": "あき",
      "meaning": "autumn",
      "meaning_id": "musim gugur",
      "tags": ["seasons", "time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か"
      ]
    },
    "kouen": {
      "jp_character": "こうえん",
      "romanji": [
        "kouen"
      ],
      "sound": "こうえん",
      "meaning": "park",
      "meaning_id": "taman",
      "tags": ["places", "nature"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "あ",
        "か"
      ]
    },
    "gakkou": {
      "jp_character": "がっこう",
      "romanji": [
        "gakkou"
      ],
      "sound": "がっこう",
      "meaning": "school",
      "meaning_id": "sekolah",
      "tags": ["places", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "た",
        "が"
      ]
    },
    "daigaku": {
      "jp_character": "だいがく",
      "romanji": [
        "daigaku"
      ],
      "sound": "だいがく",
      "meaning": "university",
      "meaning_id": "universitas",
      "tags": ["places", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "だ",
        "が"
      ]
    },
    "chuugakkou": {
      "jp_character": "ちゅうがっこう",
      "romanji": [
        "chuugakkou"
      ],
      "sound": "ちゅうがっこう",
      "meaning": "middle school",
      "meaning_id": "SMP",
      "tags": ["places", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "や",
        "あ",
        "か",
        "が"
      ]
    },
    "shougakkou": {
      "jp_character": "しょうがっこう",
      "romanji": [
        "shougakkou"
      ],
      "sound": "しょうがっこう",
      "meaning": "elementary school",
      "meaning_id": "SD",
      "tags": ["places", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "や",
        "あ",
        "か",
        "さ",
        "が"
      ]
    },
    "hoteru": {
      "jp_character": "ホテル",
      "romanji": [
        "hoteru"
      ],
      "sound": "ホテル",
      "meaning": "hotel",
      "meaning_id": "hotel",
      "tags": ["adjectives"],
      "katakana_groups": [
        "タ",
        "ラ",
        "ハ"
      ],
      "hiragana_groups": []
    },
    "misosiru": {
      "jp_character": "みそしる",
      "romanji": [
        "misosiru",
        "misoshiru"
      ],
      "sound": "みそしる",
      "meaning": "miso soup",
      "meaning_id": "sup miso",
      "tags": ["food", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "ま",
        "さ"
      ]
    },
    "toire": {
      "jp_character": "トイレ",
      "romanji": [
        "toire"
      ],
      "sound": "トイレ",
      "meaning": "toilet",
      "meaning_id": "toilet",
      "tags": ["places", "home"],
      "katakana_groups": [
        "タ",
        "ラ",
        "ア"
      ],
      "hiragana_groups": []
    },
    "denwa": {
      "jp_character": "でんわ",
      "romanji": [
        "denwa"
      ],
      "sound": "でんわ",
      "meaning": "phone",
      "meaning_id": "telepon",
      "tags": ["items", "communication"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "だ"
      ]
    },
    "terebi": {
      "jp_character": "テレビ",
      "romanji": [
        "terebi"
      ],
      "sound": "テレビ",
      "meaning": "television",
      "meaning_id": "televisi",
      "tags": ["items", "entertainment"],
      "katakana_groups": [
        "バ",
        "タ",
        "ラ"
      ],
      "hiragana_groups": []
    },
    "kuruma": {
      "jp_character": "くるま",
      "romanji": [
        "kuruma"
      ],
      "sound": "くるま",
      "meaning": "car",
      "meaning_id": "mobil",
      "tags": ["transportation"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "ら",
        "か"
      ]
    },
    "fune": {
      "jp_character": "ふね",
      "romanji": [
        "fune"
      ],
      "sound": "ふね",
      "meaning": "ship",
      "meaning_id": "kapal",
      "tags": ["transportation"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "な"
      ]
    },
    "jitensha": {
      "jp_character": "じてんしゃ",
      "romanji": [
        "jitensha"
      ],
      "sound": "じてんしゃ",
      "meaning": "bicycle",
      "meaning_id": "sepeda",
      "tags": ["transportation"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "ざ",
        "や",
        "わ",
        "さ"
      ]
    },
    "aruki": {
      "jp_character": "あるき",
      "romanji": [
        "aruki"
      ],
      "sound": "あるき",
      "meaning": "walking",
      "meaning_id": "berjalan kaki",
      "tags": ["movement", "verbs"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ",
        "か"
      ]
    },
    "sara": {
      "jp_character": "さら",
      "romanji": [
        "sara"
      ],
      "sound": "さら",
      "meaning": "plate",
      "meaning_id": "piring",
      "tags": ["items", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "さ"
      ]
    },
    "ryokan": {
      "jp_character": "りょかん",
      "romanji": [
        "ryokan"
      ],
      "sound": "りょかん",
      "meaning": "Japanese inn",
      "meaning_id": "penginapan tradisional Jepang",
      "tags": ["places", "travel", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ら",
        "か",
        "わ"
      ]
    },
    "sentou": {
      "jp_character": "せんとう",
      "romanji": [
        "sentou"
      ],
      "sound": "せんとう",
      "meaning": "public bath",
      "meaning_id": "pemandian umum",
      "tags": ["places", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "あ",
        "さ",
        "た"
      ]
    },
    "onsen": {
      "jp_character": "おんせん",
      "romanji": [
        "onsen"
      ],
      "sound": "おんせん",
      "meaning": "hot spring",
      "meaning_id": "pemandian air panas",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "あ",
        "さ"
      ]
    },
    "otaku": {
      "jp_character": "オタク",
      "romanji": [
        "otaku"
      ],
      "sound": "オタク",
      "meaning": "geek",
      "meaning_id": "otaku",
      "tags": ["basic"],
      "katakana_groups": [
        "カ",
        "タ",
        "ア"
      ],
      "hiragana_groups": []
    },
    "manga": {
      "jp_character": "まんが",
      "romanji": [
        "manga"
      ],
      "sound": "まんが",
      "meaning": "manga",
      "meaning_id": "manga / komik",
      "tags": ["entertainment", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "ま",
        "が"
      ]
    },
    "anime": {
      "jp_character": "アニメ",
      "romanji": [
        "anime"
      ],
      "sound": "アニメ",
      "meaning": "anime",
      "meaning_id": "anime",
      "tags": ["entertainment", "japanese_culture"],
      "katakana_groups": [
        "ナ",
        "マ",
        "ア"
      ],
      "hiragana_groups": []
    },
    "sumo": {
      "jp_character": "すもう",
      "romanji": [
        "sumo",
        "sumou"
      ],
      "sound": "すもう",
      "meaning": "sumo",
      "meaning_id": "sumo",
      "tags": ["sports", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "ま",
        "さ"
      ]
    },
    "chanoyu": {
      "jp_character": "ちゃのゆ",
      "romanji": [
        "chanoyu"
      ],
      "sound": "ちゃのゆ",
      "meaning": "tea ceremony",
      "meaning_id": "upacara minum teh",
      "tags": ["food", "drinks"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "た",
        "な"
      ]
    },
    "ikebana": {
      "jp_character": "いけばな",
      "romanji": [
        "ikebana"
      ],
      "sound": "いけばな",
      "meaning": "flower arrangement",
      "meaning_id": "seni merangkai bunga",
      "tags": ["activities", "japanese_culture", "art"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ば",
        "あ",
        "か",
        "な"
      ]
    },
    "bonsai": {
      "jp_character": "ぼんさい",
      "romanji": [
        "bonsai"
      ],
      "sound": "ぼんさい",
      "meaning": "bonsai",
      "meaning_id": "bonsai",
      "tags": ["hobbies", "nature", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "ば",
        "さ",
        "あ"
      ]
    },
    "kabuki": {
      "jp_character": "かぶき",
      "romanji": [
        "kabuki"
      ],
      "sound": "かぶき",
      "meaning": "Japanese theatre form",
      "meaning_id": "kabuki (teater Jepang)",
      "tags": ["basic"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ば",
        "か"
      ]
    },
    "origami": {
      "jp_character": "おりがみ",
      "romanji": [
        "origami"
      ],
      "sound": "おりがみ",
      "meaning": "origami",
      "meaning_id": "origami",
      "tags": ["activities", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ",
        "ま",
        "が"
      ]
    },
    "shamisen": {
      "jp_character": "しゃみせん",
      "romanji": [
        "shamisen"
      ],
      "sound": "しゃみせん",
      "meaning": "Japanese string instrument",
      "meaning_id": "shamisen (alat musik petik Jepang)",
      "tags": ["basic"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ま",
        "さ",
        "わ"
      ]
    },
    "furoshiki": {
      "jp_character": "ふろしき",
      "romanji": [
        "furoshiki"
      ],
      "sound": "ふろしき",
      "meaning": "traditional wrapping cloths",
      "meaning_id": "kain pembungkus tradisional",
      "tags": ["items", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "か",
        "さ",
        "は"
      ]
    },
    "ukiyoe": {
      "jp_character": "うきよえ",
      "romanji": [
        "ukiyoe"
      ],
      "sound": "うきよえ",
      "meaning": "ukiyoe (art genre)",
      "meaning_id": "ukiyo-e (seni cetak kayu)",
      "tags": ["basic"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "か"
      ]
    },
    "katana": {
      "jp_character": "かたな",
      "romanji": [
        "katana"
      ],
      "sound": "かたな",
      "meaning": "sword",
      "meaning_id": "pedang",
      "tags": ["items", "weapons", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "た",
        "な"
      ]
    },
    "judo": {
      "jp_character": "じゅどう",
      "romanji": [
        "judo",
        "judou"
      ],
      "sound": "じゅどう",
      "meaning": "judo (martial art)",
      "meaning_id": "judo",
      "tags": ["sports", "martial_arts", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "だ",
        "ざ"
      ]
    },
    "karate": {
      "jp_character": "からて",
      "romanji": [
        "karate"
      ],
      "sound": "からて",
      "meaning": "karate",
      "meaning_id": "karate",
      "tags": ["sports", "martial_arts", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "か",
        "た"
      ]
    },
    "aikido": {
      "jp_character": "あいきどう",
      "romanji": [
        "aikido",
        "aikidou"
      ],
      "sound": "あいきどう",
      "meaning": "Japanese martial art",
      "meaning_id": "aikido",
      "tags": ["sports", "martial_arts", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "だ"
      ]
    },
    "kyudo": {
      "jp_character": "きゅうどう",
      "romanji": [
        "kyudo",
        "kyuudou"
      ],
      "sound": "きゅうどう",
      "meaning": "Japanese archery",
      "meaning_id": "panahan Jepang",
      "tags": ["sports", "martial_arts", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "か",
        "だ"
      ]
    },
    "fugu": {
      "jp_character": "ふぐ",
      "romanji": [
        "fugu"
      ],
      "sound": "ふぐ",
      "meaning": "blowfish",
      "meaning_id": "ikan buntal",
      "tags": ["animals", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "が"
      ]
    },
    "iku": {
      "jp_character": "いく",
      "romanji": [
        "iku"
      ],
      "sound": "いく",
      "meaning": "to go",
      "meaning_id": "pergi",
      "tags": ["verbs", "movement"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か"
      ]
    },
    "kuru": {
      "jp_character": "くる",
      "romanji": [
        "kuru"
      ],
      "sound": "くる",
      "meaning": "to come",
      "meaning_id": "datang",
      "tags": ["verbs", "movement"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "か"
      ]
    },
    "miru": {
      "jp_character": "みる",
      "romanji": [
        "miru"
      ],
      "sound": "みる",
      "meaning": "to see",
      "meaning_id": "melihat",
      "tags": ["verbs", "senses"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "ら"
      ]
    },
    "kiku": {
      "jp_character": "きく",
      "romanji": [
        "kiku"
      ],
      "sound": "きく",
      "meaning": "to listen/ask",
      "meaning_id": "mendengar / bertanya",
      "tags": ["verbs", "senses"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か"
      ]
    },
    "hanasu": {
      "jp_character": "はなす",
      "romanji": [
        "hanasu"
      ],
      "sound": "はなす",
      "meaning": "to speak",
      "meaning_id": "berbicara",
      "tags": ["verbs", "communication"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "な",
        "さ"
      ]
    },
    "yomu": {
      "jp_character": "よむ",
      "romanji": [
        "yomu"
      ],
      "sound": "よむ",
      "meaning": "to read",
      "meaning_id": "membaca",
      "tags": ["verbs", "activities"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "や"
      ]
    },
    "kaku": {
      "jp_character": "かく",
      "romanji": [
        "kaku"
      ],
      "sound": "かく",
      "meaning": "to write",
      "meaning_id": "menulis",
      "tags": ["verbs", "activities"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か"
      ]
    },
    "neru": {
      "jp_character": "ねる",
      "romanji": [
        "neru"
      ],
      "sound": "ねる",
      "meaning": "to sleep",
      "meaning_id": "tidur",
      "tags": ["verbs", "daily_life"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "な"
      ]
    },
    "okiru": {
      "jp_character": "おきる",
      "romanji": [
        "okiru"
      ],
      "sound": "おきる",
      "meaning": "to wake up",
      "meaning_id": "bangun",
      "tags": ["verbs", "daily_life"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "ら",
        "か"
      ]
    },
    "au": {
      "jp_character": "あう",
      "romanji": [
        "au"
      ],
      "sound": "あう",
      "meaning": "to meet",
      "meaning_id": "bertemu",
      "tags": ["verbs", "social"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ"
      ]
    },
    "kau": {
      "jp_character": "かう",
      "romanji": [
        "kau"
      ],
      "sound": "かう",
      "meaning": "to buy",
      "meaning_id": "membeli",
      "tags": ["verbs", "shopping"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か"
      ]
    },
    "uru": {
      "jp_character": "うる",
      "romanji": [
        "uru"
      ],
      "sound": "うる",
      "meaning": "to sell",
      "meaning_id": "menjual",
      "tags": ["verbs", "shopping"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "ら"
      ]
    },
    "tsukuru": {
      "jp_character": "つくる",
      "romanji": [
        "tsukuru"
      ],
      "sound": "つくる",
      "meaning": "to make",
      "meaning_id": "membuat",
      "tags": ["verbs", "activities"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "か",
        "た"
      ]
    },
    "arau": {
      "jp_character": "あらう",
      "romanji": [
        "arau"
      ],
      "sound": "あらう",
      "meaning": "to wash",
      "meaning_id": "mencuci",
      "tags": ["verbs", "daily_life"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ"
      ]
    },
    "atama": {
      "jp_character": "あたま",
      "romanji": [
        "atama"
      ],
      "sound": "あたま",
      "meaning": "head",
      "meaning_id": "kepala",
      "tags": ["body_parts"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "あ",
        "た"
      ]
    },
    "me": {
      "jp_character": "め",
      "romanji": [
        "me"
      ],
      "sound": "め",
      "meaning": "eye",
      "meaning_id": "mata",
      "tags": ["body_parts"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま"
      ]
    },
    "mimi": {
      "jp_character": "みみ",
      "romanji": [
        "mimi"
      ],
      "sound": "みみ",
      "meaning": "ear",
      "meaning_id": "telinga",
      "tags": ["body_parts"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま"
      ]
    },
    "hana": {
      "jp_character": "はな",
      "romanji": [
        "hana"
      ],
      "sound": "はな",
      "meaning": "nose",
      "meaning_id": "hidung",
      "tags": ["body_parts"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "な"
      ]
    },
    "kuchi": {
      "jp_character": "くち",
      "romanji": [
        "kuchi"
      ],
      "sound": "くち",
      "meaning": "mouth",
      "meaning_id": "mulut",
      "tags": ["body_parts"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "た"
      ]
    },
    "te": {
      "jp_character": "て",
      "romanji": [
        "te"
      ],
      "sound": "て",
      "meaning": "hand",
      "meaning_id": "tangan",
      "tags": ["body_parts"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た"
      ]
    },
    "ashi": {
      "jp_character": "あし",
      "romanji": [
        "ashi"
      ],
      "sound": "あし",
      "meaning": "foot/leg",
      "meaning_id": "kaki",
      "tags": ["body_parts"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ"
      ]
    },
    "onaka": {
      "jp_character": "おなか",
      "romanji": [
        "onaka"
      ],
      "sound": "おなか",
      "meaning": "stomach",
      "meaning_id": "perut",
      "tags": ["body_parts"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "な",
        "か"
      ]
    },
    "chichi": {
      "jp_character": "ちち",
      "romanji": [
        "chichi"
      ],
      "sound": "ちち",
      "meaning": "father",
      "meaning_id": "ayah",
      "tags": ["family"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た"
      ]
    },
    "haha": {
      "jp_character": "はは",
      "romanji": [
        "haha"
      ],
      "sound": "はは",
      "meaning": "mother",
      "meaning_id": "ibu",
      "tags": ["family"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は"
      ]
    },
    "otouto": {
      "jp_character": "おとうと",
      "romanji": [
        "otouto"
      ],
      "sound": "おとうと",
      "meaning": "younger brother",
      "meaning_id": "adik laki-laki",
      "tags": ["family"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "た"
      ]
    },
    "ani": {
      "jp_character": "あに",
      "romanji": [
        "ani"
      ],
      "sound": "あに",
      "meaning": "older brother",
      "meaning_id": "kakak laki-laki",
      "tags": ["family"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "な"
      ]
    },
    "imouto": {
      "jp_character": "いもうと",
      "romanji": [
        "imouto"
      ],
      "sound": "いもうと",
      "meaning": "younger sister",
      "meaning_id": "adik perempuan",
      "tags": ["family"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "あ",
        "た"
      ]
    },
    "ane": {
      "jp_character": "あね",
      "romanji": [
        "ane"
      ],
      "sound": "あね",
      "meaning": "older sister",
      "meaning_id": "kakak perempuan",
      "tags": ["family"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "な"
      ]
    },
    "kodomo": {
      "jp_character": "こども",
      "romanji": [
        "kodomo"
      ],
      "sound": "こども",
      "meaning": "child",
      "meaning_id": "anak",
      "tags": ["family", "people"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "だ",
        "か"
      ]
    },
    "ichi": {
      "jp_character": "いち",
      "romanji": [
        "ichi"
      ],
      "sound": "いち",
      "meaning": "one",
      "meaning_id": "satu",
      "tags": ["numbers"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "た"
      ]
    },
    "ni": {
      "jp_character": "に",
      "romanji": [
        "ni"
      ],
      "sound": "に",
      "meaning": "two",
      "meaning_id": "dua",
      "tags": ["numbers"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な"
      ]
    },
    "san": {
      "jp_character": "さん",
      "romanji": [
        "san"
      ],
      "sound": "さん",
      "meaning": "three",
      "meaning_id": "tiga",
      "tags": ["numbers"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "さ"
      ]
    },
    "shi": {
      "jp_character": "し",
      "romanji": [
        "shi"
      ],
      "sound": "し",
      "meaning": "four",
      "meaning_id": "empat",
      "tags": ["numbers"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ"
      ]
    },
    "go": {
      "jp_character": "ご",
      "romanji": [
        "go"
      ],
      "sound": "ご",
      "meaning": "five",
      "meaning_id": "lima",
      "tags": ["numbers"],
      "katakana_groups": [],
      "hiragana_groups": [
        "が"
      ]
    },
    "roku": {
      "jp_character": "ろく",
      "romanji": [
        "roku"
      ],
      "sound": "ろく",
      "meaning": "six",
      "meaning_id": "enam",
      "tags": ["numbers"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "か"
      ]
    },
    "shichi": {
      "jp_character": "しち",
      "romanji": [
        "shichi"
      ],
      "sound": "しち",
      "meaning": "seven",
      "meaning_id": "tujuh",
      "tags": ["numbers"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "た"
      ]
    },
    "hachi": {
      "jp_character": "はち",
      "romanji": [
        "hachi"
      ],
      "sound": "はち",
      "meaning": "eight",
      "meaning_id": "delapan",
      "tags": ["numbers"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "た"
      ]
    },
    "kyuu": {
      "jp_character": "きゅう",
      "romanji": [
        "kyuu"
      ],
      "sound": "きゅう",
      "meaning": "nine",
      "meaning_id": "sembilan",
      "tags": ["numbers"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "か"
      ]
    },
    "juu": {
      "jp_character": "じゅう",
      "romanji": [
        "juu"
      ],
      "sound": "じゅう",
      "meaning": "ten",
      "meaning_id": "sepuluh",
      "tags": ["numbers"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "ざ"
      ]
    },
    "hyaku": {
      "jp_character": "ひゃく",
      "romanji": [
        "hyaku"
      ],
      "sound": "ひゃく",
      "meaning": "hundred",
      "meaning_id": "seratus",
      "tags": ["numbers"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "は",
        "か"
      ]
    },
    "sen": {
      "jp_character": "せん",
      "romanji": [
        "sen"
      ],
      "sound": "せん",
      "meaning": "thousand",
      "meaning_id": "seribu",
      "tags": ["numbers"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "さ"
      ]
    },
    "man": {
      "jp_character": "まん",
      "romanji": [
        "man"
      ],
      "sound": "まん",
      "meaning": "ten thousand",
      "meaning_id": "sepuluh ribu",
      "tags": ["numbers"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "わ"
      ]
    },
    "shiro": {
      "jp_character": "しろ",
      "romanji": [
        "shiro"
      ],
      "sound": "しろ",
      "meaning": "white",
      "meaning_id": "putih",
      "tags": ["colors"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "さ"
      ]
    },
    "kuro": {
      "jp_character": "くろ",
      "romanji": [
        "kuro"
      ],
      "sound": "くろ",
      "meaning": "black",
      "meaning_id": "hitam",
      "tags": ["colors"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "か"
      ]
    },
    "ao": {
      "jp_character": "あお",
      "romanji": [
        "ao"
      ],
      "sound": "あお",
      "meaning": "blue",
      "meaning_id": "biru",
      "tags": ["colors"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ"
      ]
    },
    "kiiro": {
      "jp_character": "きいろ",
      "romanji": [
        "kiiro"
      ],
      "sound": "きいろ",
      "meaning": "yellow",
      "meaning_id": "kuning",
      "tags": ["colors"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ",
        "か"
      ]
    },
    "midori": {
      "jp_character": "みどり",
      "romanji": [
        "midori"
      ],
      "sound": "みどり",
      "meaning": "green",
      "meaning_id": "hijau",
      "tags": ["colors"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "ら",
        "だ"
      ]
    },
    "chairo": {
      "jp_character": "ちゃいろ",
      "romanji": [
        "chairo"
      ],
      "sound": "ちゃいろ",
      "meaning": "brown",
      "meaning_id": "cokelat",
      "tags": ["colors"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ら",
        "あ",
        "た"
      ]
    },
    "ie": {
      "jp_character": "いえ",
      "romanji": [
        "ie"
      ],
      "sound": "いえ",
      "meaning": "house",
      "meaning_id": "rumah",
      "tags": ["places", "home"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ"
      ]
    },
    "heya": {
      "jp_character": "へや",
      "romanji": [
        "heya"
      ],
      "sound": "へや",
      "meaning": "room",
      "meaning_id": "kamar",
      "tags": ["places", "home"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "は"
      ]
    },
    "mado": {
      "jp_character": "まど",
      "romanji": [
        "mado"
      ],
      "sound": "まど",
      "meaning": "window",
      "meaning_id": "jendela",
      "tags": ["home"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "だ"
      ]
    },
    "tsukue": {
      "jp_character": "つくえ",
      "romanji": [
        "tsukue"
      ],
      "sound": "つくえ",
      "meaning": "desk",
      "meaning_id": "meja",
      "tags": ["home", "furniture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "た"
      ]
    },
    "isu": {
      "jp_character": "いす",
      "romanji": [
        "isu"
      ],
      "sound": "いす",
      "meaning": "chair",
      "meaning_id": "kursi",
      "tags": ["home", "furniture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ"
      ]
    },
    "beddo": {
      "jp_character": "ベッド",
      "romanji": [
        "beddo"
      ],
      "sound": "ベッド",
      "meaning": "bed",
      "meaning_id": "kasur",
      "tags": ["home", "furniture"],
      "katakana_groups": [
        "バ",
        "タ",
        "ダ"
      ],
      "hiragana_groups": []
    },
    "hon": {
      "jp_character": "ほん",
      "romanji": [
        "hon"
      ],
      "sound": "ほん",
      "meaning": "book",
      "meaning_id": "buku",
      "tags": ["items", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "は"
      ]
    },
    "enpitsu": {
      "jp_character": "えんぴつ",
      "romanji": [
        "enpitsu"
      ],
      "sound": "えんぴつ",
      "meaning": "pencil",
      "meaning_id": "pensil",
      "tags": ["items", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "ぱ",
        "あ",
        "た"
      ]
    },
    "kami": {
      "jp_character": "かみ",
      "romanji": [
        "kami"
      ],
      "sound": "かみ",
      "meaning": "paper",
      "meaning_id": "kertas",
      "tags": ["items"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "か"
      ]
    },
    "kaban": {
      "jp_character": "かばん",
      "romanji": [
        "kaban"
      ],
      "sound": "かばん",
      "meaning": "bag",
      "meaning_id": "tas",
      "tags": ["items", "accessories"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "ば",
        "か"
      ]
    },
    "tokei": {
      "jp_character": "とけい",
      "romanji": [
        "tokei"
      ],
      "sound": "とけい",
      "meaning": "clock/watch",
      "meaning_id": "jam",
      "tags": ["items", "time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "た"
      ]
    },
    "kutsu": {
      "jp_character": "くつ",
      "romanji": [
        "kutsu"
      ],
      "sound": "くつ",
      "meaning": "shoes",
      "meaning_id": "sepatu",
      "tags": ["clothing", "accessories"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "た"
      ]
    },
    "fuku": {
      "jp_character": "ふく",
      "romanji": [
        "fuku"
      ],
      "sound": "ふく",
      "meaning": "clothes",
      "meaning_id": "baju",
      "tags": ["clothing"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "か"
      ]
    },
    "zubon": {
      "jp_character": "ズボン",
      "romanji": [
        "zubon"
      ],
      "sound": "ズボン",
      "meaning": "pants",
      "meaning_id": "celana",
      "tags": ["clothing"],
      "katakana_groups": [
        "ザ",
        "ワ",
        "バ"
      ],
      "hiragana_groups": []
    },
    "shatsu": {
      "jp_character": "シャツ",
      "romanji": [
        "shatsu"
      ],
      "sound": "シャツ",
      "meaning": "shirt",
      "meaning_id": "kemeja",
      "tags": ["clothing"],
      "katakana_groups": [
        "サ",
        "ヤ",
        "タ"
      ],
      "hiragana_groups": []
    },
    "boushi": {
      "jp_character": "ぼうし",
      "romanji": [
        "boushi"
      ],
      "sound": "ぼうし",
      "meaning": "hat",
      "meaning_id": "topi",
      "tags": ["clothing", "accessories"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ば",
        "あ",
        "さ"
      ]
    },
    "megane": {
      "jp_character": "めがね",
      "romanji": [
        "megane"
      ],
      "sound": "めがね",
      "meaning": "glasses",
      "meaning_id": "kacamata",
      "tags": ["accessories"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "な",
        "が"
      ]
    },
    "ame": {
      "jp_character": "あめ",
      "romanji": [
        "ame"
      ],
      "sound": "あめ",
      "meaning": "rain",
      "meaning_id": "hujan",
      "tags": ["weather", "nature"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "あ"
      ]
    },
    "yuki": {
      "jp_character": "ゆき",
      "romanji": [
        "yuki"
      ],
      "sound": "ゆき",
      "meaning": "snow",
      "meaning_id": "salju",
      "tags": ["weather", "nature"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "か"
      ]
    },
    "kaze": {
      "jp_character": "かぜ",
      "romanji": [
        "kaze"
      ],
      "sound": "かぜ",
      "meaning": "wind",
      "meaning_id": "angin",
      "tags": ["weather", "nature"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "ざ"
      ]
    },
    "tenki": {
      "jp_character": "てんき",
      "romanji": [
        "tenki"
      ],
      "sound": "てんき",
      "meaning": "weather",
      "meaning_id": "cuaca",
      "tags": ["weather"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "た",
        "か"
      ]
    },
    "atsui": {
      "jp_character": "あつい",
      "romanji": [
        "atsui"
      ],
      "sound": "あつい",
      "meaning": "hot",
      "meaning_id": "panas",
      "tags": ["weather", "adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "た"
      ]
    },
    "suzushii": {
      "jp_character": "すずしい",
      "romanji": [
        "suzushii"
      ],
      "sound": "すずしい",
      "meaning": "cool",
      "meaning_id": "sejuk",
      "tags": ["weather", "adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ざ",
        "あ",
        "さ"
      ]
    },
    "atarashii": {
      "jp_character": "あたらしい",
      "romanji": [
        "atarashii"
      ],
      "sound": "あたらしい",
      "meaning": "new",
      "meaning_id": "baru",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ",
        "さ",
        "た"
      ]
    },
    "furui": {
      "jp_character": "ふるい",
      "romanji": [
        "furui"
      ],
      "sound": "ふるい",
      "meaning": "old",
      "meaning_id": "lama (barang)",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ",
        "は"
      ]
    },
    "hayai": {
      "jp_character": "はやい",
      "romanji": [
        "hayai"
      ],
      "sound": "はやい",
      "meaning": "fast/early",
      "meaning_id": "cepat / pagi",
      "tags": ["adjectives", "time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "は"
      ]
    },
    "osoi": {
      "jp_character": "おそい",
      "romanji": [
        "osoi"
      ],
      "sound": "おそい",
      "meaning": "slow/late",
      "meaning_id": "lambat / terlambat",
      "tags": ["adjectives", "time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ"
      ]
    },
    "tooi": {
      "jp_character": "とおい",
      "romanji": [
        "tooi"
      ],
      "sound": "とおい",
      "meaning": "far",
      "meaning_id": "jauh",
      "tags": ["adjectives", "distance"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "た"
      ]
    },
    "chikai": {
      "jp_character": "ちかい",
      "romanji": [
        "chikai"
      ],
      "sound": "ちかい",
      "meaning": "near",
      "meaning_id": "dekat",
      "tags": ["adjectives", "distance"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "た"
      ]
    },
    "nagai": {
      "jp_character": "ながい",
      "romanji": [
        "nagai"
      ],
      "sound": "ながい",
      "meaning": "long",
      "meaning_id": "panjang",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "が",
        "あ"
      ]
    },
    "mijikai": {
      "jp_character": "みじかい",
      "romanji": [
        "mijikai"
      ],
      "sound": "みじかい",
      "meaning": "short",
      "meaning_id": "pendek",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "ざ",
        "あ",
        "か"
      ]
    },
    "hiroi": {
      "jp_character": "ひろい",
      "romanji": [
        "hiroi"
      ],
      "sound": "ひろい",
      "meaning": "wide/spacious",
      "meaning_id": "luas",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ",
        "は"
      ]
    },
    "semai": {
      "jp_character": "せまい",
      "romanji": [
        "semai"
      ],
      "sound": "せまい",
      "meaning": "narrow",
      "meaning_id": "sempit",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "あ",
        "さ"
      ]
    },
    "oishii": {
      "jp_character": "おいしい",
      "romanji": [
        "oishii"
      ],
      "sound": "おいしい",
      "meaning": "delicious",
      "meaning_id": "enak",
      "tags": ["adjectives", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ"
      ]
    },
    "mazui": {
      "jp_character": "まずい",
      "romanji": [
        "mazui"
      ],
      "sound": "まずい",
      "meaning": "bad tasting",
      "meaning_id": "tidak enak",
      "tags": ["adjectives", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "ざ",
        "あ"
      ]
    },
    "umai": {
      "jp_character": "うまい",
      "romanji": [
        "umai"
      ],
      "sound": "うまい",
      "meaning": "delicious/skillful",
      "meaning_id": "enak / pandai",
      "tags": ["adjectives", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "あ"
      ]
    },
    "genki": {
      "jp_character": "げんき",
      "romanji": [
        "genki"
      ],
      "sound": "げんき",
      "meaning": "energetic/healthy",
      "meaning_id": "sehat / bersemangat",
      "tags": ["adjectives", "feelings"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "か",
        "が"
      ]
    },
    "kirei": {
      "jp_character": "きれい",
      "romanji": [
        "kirei"
      ],
      "sound": "きれい",
      "meaning": "pretty/clean",
      "meaning_id": "cantik / bersih",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ",
        "か"
      ]
    },
    "kitanai": {
      "jp_character": "きたない",
      "romanji": [
        "kitanai"
      ],
      "sound": "きたない",
      "meaning": "dirty",
      "meaning_id": "kotor",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "あ",
        "か",
        "た"
      ]
    },
    "shizuka": {
      "jp_character": "しずか",
      "romanji": [
        "shizuka"
      ],
      "sound": "しずか",
      "meaning": "quiet",
      "meaning_id": "tenang",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ざ",
        "か",
        "さ"
      ]
    },
    "urusai": {
      "jp_character": "うるさい",
      "romanji": [
        "urusai"
      ],
      "sound": "うるさい",
      "meaning": "noisy",
      "meaning_id": "berisik",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ",
        "さ"
      ]
    },
    "benri": {
      "jp_character": "べんり",
      "romanji": [
        "benri"
      ],
      "sound": "べんり",
      "meaning": "convenient",
      "meaning_id": "praktis",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ば",
        "ら",
        "わ"
      ]
    },
    "michi": {
      "jp_character": "みち",
      "romanji": [
        "michi"
      ],
      "sound": "みち",
      "meaning": "road/path",
      "meaning_id": "jalan",
      "tags": ["places", "directions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "た"
      ]
    },
    "eki": {
      "jp_character": "えき",
      "romanji": [
        "eki"
      ],
      "sound": "えき",
      "meaning": "station",
      "meaning_id": "stasiun",
      "tags": ["places", "transportation"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か"
      ]
    },
    "machi": {
      "jp_character": "まち",
      "romanji": [
        "machi"
      ],
      "sound": "まち",
      "meaning": "town/city",
      "meaning_id": "kota",
      "tags": ["places"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "た"
      ]
    },
    "yama": {
      "jp_character": "やま",
      "romanji": [
        "yama"
      ],
      "sound": "やま",
      "meaning": "mountain",
      "meaning_id": "gunung",
      "tags": ["nature", "places"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ま"
      ]
    },
    "umi": {
      "jp_character": "うみ",
      "romanji": [
        "umi"
      ],
      "sound": "うみ",
      "meaning": "sea/ocean",
      "meaning_id": "laut",
      "tags": ["nature", "places"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "あ"
      ]
    },
    "kawa": {
      "jp_character": "かわ",
      "romanji": [
        "kawa"
      ],
      "sound": "かわ",
      "meaning": "river",
      "meaning_id": "sungai",
      "tags": ["nature", "places"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "か"
      ]
    },
    "sora": {
      "jp_character": "そら",
      "romanji": [
        "sora"
      ],
      "sound": "そら",
      "meaning": "sky",
      "meaning_id": "langit",
      "tags": ["nature"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "さ"
      ]
    },
    "tsuki": {
      "jp_character": "つき",
      "romanji": [
        "tsuki"
      ],
      "sound": "つき",
      "meaning": "moon",
      "meaning_id": "bulan",
      "tags": ["nature"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "た"
      ]
    },
    "hoshi": {
      "jp_character": "ほし",
      "romanji": [
        "hoshi"
      ],
      "sound": "ほし",
      "meaning": "star",
      "meaning_id": "bintang",
      "tags": ["nature"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "さ"
      ]
    },
    "taiyou": {
      "jp_character": "たいよう",
      "romanji": [
        "taiyou"
      ],
      "sound": "たいよう",
      "meaning": "sun",
      "meaning_id": "matahari",
      "tags": ["nature"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "た"
      ]
    },
    "inu": {
      "jp_character": "いぬ",
      "romanji": [
        "inu"
      ],
      "sound": "いぬ",
      "meaning": "dog",
      "meaning_id": "anjing",
      "tags": ["animals", "pets"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "な"
      ]
    },
    "sakana": {
      "jp_character": "さかな",
      "romanji": [
        "sakana"
      ],
      "sound": "さかな",
      "meaning": "fish",
      "meaning_id": "ikan",
      "tags": ["animals", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "か",
        "な"
      ]
    },
    "sensei": {
      "jp_character": "せんせい",
      "romanji": [
        "sensei"
      ],
      "sound": "せんせい",
      "meaning": "teacher",
      "meaning_id": "guru",
      "tags": ["people", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "あ",
        "さ"
      ]
    },
    "gakusei": {
      "jp_character": "がくせい",
      "romanji": [
        "gakusei"
      ],
      "sound": "がくせい",
      "meaning": "student",
      "meaning_id": "pelajar",
      "tags": ["people", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "が",
        "あ",
        "か",
        "さ"
      ]
    },
    "tomodachi": {
      "jp_character": "ともだち",
      "romanji": [
        "tomodachi"
      ],
      "sound": "ともだち",
      "meaning": "friend",
      "meaning_id": "teman",
      "tags": ["people", "social"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "だ",
        "た"
      ]
    },
    "hito": {
      "jp_character": "ひと",
      "romanji": [
        "hito"
      ],
      "sound": "ひと",
      "meaning": "person",
      "meaning_id": "orang",
      "tags": ["people"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "た"
      ]
    },
    "otoko": {
      "jp_character": "おとこ",
      "romanji": [
        "otoko"
      ],
      "sound": "おとこ",
      "meaning": "man",
      "meaning_id": "laki-laki",
      "tags": ["people"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "た"
      ]
    },
    "onna": {
      "jp_character": "おんな",
      "romanji": [
        "onna"
      ],
      "sound": "おんな",
      "meaning": "woman",
      "meaning_id": "perempuan",
      "tags": ["people"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "あ",
        "な"
      ]
    },
    "asa": {
      "jp_character": "あさ",
      "romanji": [
        "asa"
      ],
      "sound": "あさ",
      "meaning": "morning",
      "meaning_id": "pagi",
      "tags": ["time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ"
      ]
    },
    "hiru": {
      "jp_character": "ひる",
      "romanji": [
        "hiru"
      ],
      "sound": "ひる",
      "meaning": "afternoon/noon",
      "meaning_id": "siang",
      "tags": ["time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "は"
      ]
    },
    "ban": {
      "jp_character": "ばん",
      "romanji": [
        "ban"
      ],
      "sound": "ばん",
      "meaning": "evening",
      "meaning_id": "malam",
      "tags": ["time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "ば"
      ]
    },
    "yoru": {
      "jp_character": "よる",
      "romanji": [
        "yoru"
      ],
      "sound": "よる",
      "meaning": "night",
      "meaning_id": "malam hari",
      "tags": ["time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ら"
      ]
    },
    "ima": {
      "jp_character": "いま",
      "romanji": [
        "ima"
      ],
      "sound": "いま",
      "meaning": "now",
      "meaning_id": "sekarang",
      "tags": ["time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "あ"
      ]
    },
    "mainichi": {
      "jp_character": "まいにち",
      "romanji": [
        "mainichi"
      ],
      "sound": "まいにち",
      "meaning": "every day",
      "meaning_id": "setiap hari",
      "tags": ["time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "あ",
        "な",
        "た"
      ]
    },
    "totemo": {
      "jp_character": "とても",
      "romanji": [
        "totemo"
      ],
      "sound": "とても",
      "meaning": "very",
      "meaning_id": "sangat",
      "tags": ["adverbs"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "た"
      ]
    },
    "sukoshi": {
      "jp_character": "すこし",
      "romanji": [
        "sukoshi"
      ],
      "sound": "すこし",
      "meaning": "a little",
      "meaning_id": "sedikit",
      "tags": ["adverbs"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "さ"
      ]
    },
    "takusan": {
      "jp_character": "たくさん",
      "romanji": [
        "takusan"
      ],
      "sound": "たくさん",
      "meaning": "many/a lot",
      "meaning_id": "banyak",
      "tags": ["adverbs"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "か",
        "さ",
        "た"
      ]
    },
    "amari": {
      "jp_character": "あまり",
      "romanji": [
        "amari"
      ],
      "sound": "あまり",
      "meaning": "not very",
      "meaning_id": "tidak terlalu",
      "tags": ["adverbs"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "ら",
        "あ"
      ]
    },
    "migi": {
      "jp_character": "みぎ",
      "romanji": [
        "migi"
      ],
      "sound": "みぎ",
      "meaning": "right",
      "meaning_id": "kanan",
      "tags": ["directions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "が"
      ]
    },
    "hidari": {
      "jp_character": "ひだり",
      "romanji": [
        "hidari"
      ],
      "sound": "ひだり",
      "meaning": "left",
      "meaning_id": "kiri",
      "tags": ["directions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "だ",
        "は"
      ]
    },
    "ue": {
      "jp_character": "うえ",
      "romanji": [
        "ue"
      ],
      "sound": "うえ",
      "meaning": "above/up",
      "meaning_id": "atas",
      "tags": ["directions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ"
      ]
    },
    "shita": {
      "jp_character": "した",
      "romanji": [
        "shita"
      ],
      "sound": "した",
      "meaning": "below/down",
      "meaning_id": "bawah",
      "tags": ["directions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "た"
      ]
    },
    "naka": {
      "jp_character": "なか",
      "romanji": [
        "naka"
      ],
      "sound": "なか",
      "meaning": "inside",
      "meaning_id": "dalam",
      "tags": ["directions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "か"
      ]
    },
    "soto": {
      "jp_character": "そと",
      "romanji": [
        "soto"
      ],
      "sound": "そと",
      "meaning": "outside",
      "meaning_id": "luar",
      "tags": ["directions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "た"
      ]
    },
    "mae": {
      "jp_character": "まえ",
      "romanji": [
        "mae"
      ],
      "sound": "まえ",
      "meaning": "front/before",
      "meaning_id": "depan / sebelum",
      "tags": ["directions", "time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "あ"
      ]
    },
    "ushiro": {
      "jp_character": "うしろ",
      "romanji": [
        "ushiro"
      ],
      "sound": "うしろ",
      "meaning": "back/behind",
      "meaning_id": "belakang",
      "tags": ["directions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "さ",
        "あ"
      ]
    },
    "となri": {
      "jp_character": "となり",
      "romanji": [
        "tonari"
      ],
      "sound": "となり",
      "meaning": "next to",
      "meaning_id": "sebelah",
      "tags": ["directions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "な",
        "た"
      ]
    },
    "aida": {
      "jp_character": "あいだ",
      "romanji": [
        "aida"
      ],
      "sound": "あいだ",
      "meaning": "between",
      "meaning_id": "di antara",
      "tags": ["directions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "だ"
      ]
    },
    "gohan": {
      "jp_character": "ごはん",
      "romanji": [
        "gohan"
      ],
      "sound": "ごはん",
      "meaning": "rice/meal",
      "meaning_id": "nasi / makanan",
      "tags": ["food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "は",
        "が"
      ]
    },
    "niku": {
      "jp_character": "にく",
      "romanji": [
        "niku"
      ],
      "sound": "にく",
      "meaning": "meat",
      "meaning_id": "daging",
      "tags": ["food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "か"
      ]
    },
    "ocha": {
      "jp_character": "おちゃ",
      "romanji": [
        "ocha"
      ],
      "sound": "おちゃ",
      "meaning": "tea",
      "meaning_id": "teh hijau",
      "tags": ["food", "drinks"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "た"
      ]
    },
    "kissaten": {
      "jp_character": "きっさてん",
      "romanji": [
        "kissaten"
      ],
      "sound": "きっさてん",
      "meaning": "cafe",
      "meaning_id": "kafe",
      "tags": ["places", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "さ",
        "た",
        "か"
      ]
    },
    "resutoran": {
      "jp_character": "レストラン",
      "romanji": [
        "resutoran"
      ],
      "sound": "レストラン",
      "meaning": "restaurant",
      "meaning_id": "restoran",
      "tags": ["places", "food"],
      "katakana_groups": [
        "ラ",
        "サ",
        "タ",
        "ワ"
      ],
      "hiragana_groups": []
    },
    "depaato": {
      "jp_character": "デパート",
      "romanji": [
        "depaato"
      ],
      "sound": "デパート",
      "meaning": "department store",
      "meaning_id": "toserba",
      "tags": ["places", "shopping"],
      "katakana_groups": [
        "ダ",
        "パ",
        "タ"
      ],
      "hiragana_groups": []
    },
    "yuubinkyoku": {
      "jp_character": "ゆうびんきょく",
      "romanji": [
        "yuubinkyoku"
      ],
      "sound": "ゆうびんきょく",
      "meaning": "post office",
      "meaning_id": "kantor pos",
      "tags": ["places"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "か",
        "ば",
        "わ"
      ]
    },
    "toshokan": {
      "jp_character": "としょかん",
      "romanji": [
        "toshokan"
      ],
      "sound": "としょかん",
      "meaning": "library",
      "meaning_id": "perpustakaan",
      "tags": ["places", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "か",
        "や",
        "さ",
        "た"
      ]
    },
    "kuni": {
      "jp_character": "くに",
      "romanji": [
        "kuni"
      ],
      "sound": "くに",
      "meaning": "country",
      "meaning_id": "negara",
      "tags": ["places"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "な"
      ]
    },
    "eigo": {
      "jp_character": "えいご",
      "romanji": [
        "eigo"
      ],
      "sound": "えいご",
      "meaning": "English language",
      "meaning_id": "bahasa Inggris",
      "tags": ["languages", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "が",
        "あ"
      ]
    },
    "namae": {
      "jp_character": "なまえ",
      "romanji": [
        "namae"
      ],
      "sound": "なまえ",
      "meaning": "name",
      "meaning_id": "nama",
      "tags": ["basic"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "な",
        "あ"
      ]
    },
    "shigoto": {
      "jp_character": "しごと",
      "romanji": [
        "shigoto"
      ],
      "sound": "しごと",
      "meaning": "work/job",
      "meaning_id": "pekerjaan",
      "tags": ["work"],
      "katakana_groups": [],
      "hiragana_groups": [
        "が",
        "さ",
        "た"
      ]
    },
    "kaisha": {
      "jp_character": "かいしゃ",
      "romanji": [
        "kaisha"
      ],
      "sound": "かいしゃ",
      "meaning": "company",
      "meaning_id": "perusahaan",
      "tags": ["work"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "か",
        "さ"
      ]
    },
    "okane": {
      "jp_character": "おかね",
      "romanji": [
        "okane"
      ],
      "sound": "おかね",
      "meaning": "money",
      "meaning_id": "uang",
      "tags": ["shopping", "money"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "な"
      ]
    },
    "omoi": {
      "jp_character": "おもい",
      "romanji": [
        "omoi"
      ],
      "sound": "おもい",
      "meaning": "heavy",
      "meaning_id": "berat",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "あ"
      ]
    },
    "karui": {
      "jp_character": "かるい",
      "romanji": [
        "karui"
      ],
      "sound": "かるい",
      "meaning": "light",
      "meaning_id": "ringan",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ",
        "か"
      ]
    },
    "tsuyoi": {
      "jp_character": "つよい",
      "romanji": [
        "tsuyoi"
      ],
      "sound": "つよい",
      "meaning": "strong",
      "meaning_id": "kuat",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "た"
      ]
    },
    "yowai": {
      "jp_character": "よわい",
      "romanji": [
        "yowai"
      ],
      "sound": "よわい",
      "meaning": "weak",
      "meaning_id": "lemah",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "わ",
        "あ"
      ]
    },
    "omoshiro": {
      "jp_character": "おもしろ",
      "romanji": [
        "omoshiro"
      ],
      "sound": "おもしろ",
      "meaning": "interesting",
      "meaning_id": "menarik",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "ま",
        "さ",
        "あ"
      ]
    },
    "wakarimasu": {
      "jp_character": "わかります",
      "romanji": [
        "wakarimasu"
      ],
      "sound": "わかります",
      "meaning": "to understand",
      "meaning_id": "mengerti",
      "tags": ["verbs", "understanding"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "ら",
        "わ",
        "か",
        "さ"
      ]
    },
    "dekimasu": {
      "jp_character": "できます",
      "romanji": [
        "dekimasu"
      ],
      "sound": "できます",
      "meaning": "can do/be able to",
      "meaning_id": "bisa / mampu",
      "tags": ["verbs", "ability"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "か",
        "さ",
        "だ"
      ]
    },
    "shousetsu": {
      "jp_character": "しょうせつ",
      "romanji": [
        "shousetsu"
      ],
      "sound": "しょうせつ",
      "meaning": "novel",
      "meaning_id": "novel",
      "tags": ["items", "entertainment"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "さ",
        "た"
      ]
    },
    "eiga": {
      "jp_character": "えいが",
      "romanji": [
        "eiga"
      ],
      "sound": "えいが",
      "meaning": "movie",
      "meaning_id": "film",
      "tags": ["entertainment"],
      "katakana_groups": [],
      "hiragana_groups": [
        "が",
        "あ"
      ]
    },
    "ongaku": {
      "jp_character": "おんがく",
      "romanji": [
        "ongaku"
      ],
      "sound": "おんがく",
      "meaning": "music",
      "meaning_id": "musik",
      "tags": ["entertainment"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "が",
        "あ",
        "か"
      ]
    },
    "geemu": {
      "jp_character": "ゲーム",
      "romanji": [
        "geemu"
      ],
      "sound": "ゲーム",
      "meaning": "game",
      "meaning_id": "game",
      "tags": ["entertainment", "otaku"],
      "katakana_groups": [
        "ガ",
        "マ"
      ],
      "hiragana_groups": []
    },
    "cosplay": {
      "jp_character": "コスプレ",
      "romanji": [
        "cosplay",
        "kosupure"
      ],
      "sound": "コスプレ",
      "meaning": "cosplay",
      "meaning_id": "cosplay",
      "tags": ["otaku", "anime"],
      "katakana_groups": [
        "カ",
        "サ",
        "パ",
        "ラ"
      ],
      "hiragana_groups": []
    },
    "waifu": {
      "jp_character": "ワイフ",
      "romanji": [
        "waifu"
      ],
      "sound": "ワイフ",
      "meaning": "waifu",
      "meaning_id": "waifu",
      "tags": ["otaku", "anime"],
      "katakana_groups": [
        "ワ",
        "ア",
        "ハ"
      ],
      "hiragana_groups": []
    },
    "senpai": {
      "jp_character": "せんぱい",
      "romanji": [
        "senpai"
      ],
      "sound": "せんぱい",
      "meaning": "senior/upperclassman",
      "meaning_id": "senior",
      "tags": ["school", "social"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "ぱ",
        "あ",
        "さ"
      ]
    },
    "kouhai": {
      "jp_character": "こうはい",
      "romanji": [
        "kouhai"
      ],
      "sound": "こうはい",
      "meaning": "junior/underclassman",
      "meaning_id": "junior",
      "tags": ["school", "social"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "あ",
        "か"
      ]
    },
    "yandere": {
      "jp_character": "ヤンデレ",
      "romanji": [
        "yandere"
      ],
      "sound": "ヤンデレ",
      "meaning": "yandere character type",
      "meaning_id": "yandere (tipe karakter)",
      "tags": ["otaku", "anime"],
      "katakana_groups": [
        "ヤ",
        "ワ",
        "ダ",
        "ラ"
      ],
      "hiragana_groups": []
    },
    "tsundere": {
      "jp_character": "ツンデレ",
      "romanji": [
        "tsundere"
      ],
      "sound": "ツンデレ",
      "meaning": "tsundere character type",
      "meaning_id": "tsundere (tipe karakter)",
      "tags": ["otaku", "anime"],
      "katakana_groups": [
        "タ",
        "ワ",
        "ダ",
        "ラ"
      ],
      "hiragana_groups": []
    },
    "mecha": {
      "jp_character": "メカ",
      "romanji": [
        "mecha"
      ],
      "sound": "メカ",
      "meaning": "mecha/robot",
      "meaning_id": "mecha / robot",
      "tags": ["otaku", "anime"],
      "katakana_groups": [
        "マ",
        "カ"
      ],
      "hiragana_groups": []
    },
    "shounen": {
      "jp_character": "しょうねん",
      "romanji": [
        "shounen"
      ],
      "sound": "しょうねん",
      "meaning": "boy/shounen genre",
      "meaning_id": "anak laki-laki / genre shounen",
      "tags": ["otaku", "anime", "manga"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "や",
        "あ",
        "な",
        "わ"
      ]
    },
    "shoujo": {
      "jp_character": "しょうじょ",
      "romanji": [
        "shoujo"
      ],
      "sound": "しょうじょ",
      "meaning": "girl/shoujo genre",
      "meaning_id": "anak perempuan / genre shoujo",
      "tags": ["otaku", "anime", "manga"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "ざ",
        "さ"
      ]
    },
    "kawaisou": {
      "jp_character": "かわいそう",
      "romanji": [
        "kawaisou"
      ],
      "sound": "かわいそう",
      "meaning": "pitiful/poor thing",
      "meaning_id": "kasihan",
      "tags": ["feelings", "expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "あ",
        "か",
        "さ"
      ]
    },
    "sugoi": {
      "jp_character": "すごい",
      "romanji": [
        "sugoi"
      ],
      "sound": "すごい",
      "meaning": "amazing/awesome",
      "meaning_id": "luar biasa",
      "tags": ["adjectives", "expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "が",
        "あ",
        "さ"
      ]
    },
    "yabai": {
      "jp_character": "やばい",
      "romanji": [
        "yabai"
      ],
      "sound": "やばい",
      "meaning": "dangerous/crazy/awesome",
      "meaning_id": "gawat / keren",
      "tags": ["slang", "expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ば",
        "あ"
      ]
    },
    "kimochi": {
      "jp_character": "きもち",
      "romanji": [
        "kimochi"
      ],
      "sound": "きもち",
      "meaning": "feeling",
      "meaning_id": "perasaan",
      "tags": ["feelings"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "か",
        "た"
      ]
    },
    "itai": {
      "jp_character": "いたい",
      "romanji": [
        "itai"
      ],
      "sound": "いたい",
      "meaning": "painful/ouch",
      "meaning_id": "sakit / aduh",
      "tags": ["feelings", "expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "た"
      ]
    },
    "daijoubu": {
      "jp_character": "だいじょうぶ",
      "romanji": [
        "daijoubu"
      ],
      "sound": "だいじょうぶ",
      "meaning": "okay/alright",
      "meaning_id": "tidak apa-apa",
      "tags": ["expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "だ",
        "あ",
        "ざ",
        "や",
        "ば"
      ]
    },
    "yokatta": {
      "jp_character": "よかった",
      "romanji": [
        "yokatta"
      ],
      "sound": "よかった",
      "meaning": "I'm glad/that's good",
      "meaning_id": "syukurlah",
      "tags": ["expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "か",
        "た"
      ]
    },
    "ganbatte": {
      "jp_character": "がんばって",
      "romanji": [
        "ganbatte"
      ],
      "sound": "がんばって",
      "meaning": "do your best/good luck",
      "meaning_id": "semangat!",
      "tags": ["expressions", "encouragement"],
      "katakana_groups": [],
      "hiragana_groups": [
        "が",
        "わ",
        "ば",
        "た"
      ]
    },
    "omedetou": {
      "jp_character": "おめでとう",
      "romanji": [
        "omedetou"
      ],
      "sound": "おめでとう",
      "meaning": "congratulations",
      "meaning_id": "selamat",
      "tags": ["expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "だ",
        "あ",
        "た"
      ]
    },
    "sumimasen": {
      "jp_character": "すみません",
      "romanji": [
        "sumimasen"
      ],
      "sound": "すみません",
      "meaning": "excuse me/sorry",
      "meaning_id": "permisi / maaf",
      "tags": ["expressions", "politeness"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "わ",
        "さ"
      ]
    },
    "itadakimasu": {
      "jp_character": "いただきます",
      "romanji": [
        "itadakimasu"
      ],
      "sound": "いただきます",
      "meaning": "let's eat (before meal)",
      "meaning_id": "selamat makan (sebelum makan)",
      "tags": ["expressions", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "だ",
        "あ",
        "か",
        "た",
        "さ"
      ]
    },
    "gochisousama": {
      "jp_character": "ごちそうさま",
      "romanji": [
        "gochisousama"
      ],
      "sound": "ごちそうさま",
      "meaning": "thank you for the meal (after eating)",
      "meaning_id": "terima kasih atas makanannya",
      "tags": ["expressions", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "が",
        "た",
        "さ",
        "あ",
        "ま"
      ]
    },
    "ohayou": {
      "jp_character": "おはよう",
      "romanji": [
        "ohayou"
      ],
      "sound": "おはよう",
      "meaning": "good morning",
      "meaning_id": "selamat pagi",
      "tags": ["expressions", "greetings"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "や",
        "あ"
      ]
    },
    "konnichiwa": {
      "jp_character": "こんにちは",
      "romanji": [
        "konnichiwa"
      ],
      "sound": "こんにちは",
      "meaning": "hello/good afternoon",
      "meaning_id": "halo / selamat siang",
      "tags": ["expressions", "greetings"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "わ",
        "な",
        "た",
        "は"
      ]
    },
    "konbanwa": {
      "jp_character": "こんばんは",
      "romanji": [
        "konbanwa"
      ],
      "sound": "こんばんは",
      "meaning": "good evening",
      "meaning_id": "selamat malam",
      "tags": ["expressions", "greetings"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "ば",
        "は",
        "か"
      ]
    },
    "oyasumi": {
      "jp_character": "おやすみ",
      "romanji": [
        "oyasumi"
      ],
      "sound": "おやすみ",
      "meaning": "good night",
      "meaning_id": "selamat tidur",
      "tags": ["expressions", "greetings"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ま",
        "さ",
        "あ"
      ]
    },
    "sayounara": {
      "jp_character": "さようなら",
      "romanji": [
        "sayounara"
      ],
      "sound": "さようなら",
      "meaning": "goodbye",
      "meaning_id": "selamat tinggal",
      "tags": ["expressions", "greetings"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ら",
        "な",
        "さ",
        "あ"
      ]
    },
    "ja_mata": {
      "jp_character": "じゃまた",
      "romanji": [
        "ja mata",
        "jamata"
      ],
      "sound": "じゃまた",
      "meaning": "see you later",
      "meaning_id": "sampai jumpa",
      "tags": ["expressions", "greetings"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ま",
        "た",
        "ざ"
      ]
    },
    "kaeru": {
      "jp_character": "かえる",
      "romanji": [
        "kaeru"
      ],
      "sound": "かえる",
      "meaning": "to return home / frog",
      "meaning_id": "pulang / katak",
      "tags": ["verbs", "movement"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "あ",
        "ら"
      ]
    },
    "harau": {
      "jp_character": "はらう",
      "romanji": [
        "harau"
      ],
      "sound": "はらう",
      "meaning": "to pay",
      "meaning_id": "membayar",
      "tags": ["verbs", "shopping"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "ら",
        "あ"
      ]
    },
    "aruku": {
      "jp_character": "あるく",
      "romanji": [
        "aruku"
      ],
      "sound": "あるく",
      "meaning": "to walk",
      "meaning_id": "berjalan",
      "tags": ["verbs", "movement"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "ら",
        "か"
      ]
    },
    "hashiru": {
      "jp_character": "はしる",
      "romanji": [
        "hashiru"
      ],
      "sound": "はしる",
      "meaning": "to run",
      "meaning_id": "berlari",
      "tags": ["verbs", "movement"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "さ",
        "ら"
      ]
    },
    "oyogu": {
      "jp_character": "およぐ",
      "romanji": [
        "oyogu"
      ],
      "sound": "およぐ",
      "meaning": "to swim",
      "meaning_id": "berenang",
      "tags": ["verbs", "activities"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "や",
        "が"
      ]
    },
    "asobu": {
      "jp_character": "あそぶ",
      "romanji": [
        "asobu"
      ],
      "sound": "あそぶ",
      "meaning": "to play",
      "meaning_id": "bermain",
      "tags": ["verbs", "activities"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ",
        "ば"
      ]
    },
    "utau": {
      "jp_character": "うたう",
      "romanji": [
        "utau"
      ],
      "sound": "うたう",
      "meaning": "to sing",
      "meaning_id": "bernyanyi",
      "tags": ["verbs", "activities"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "た"
      ]
    },
    "odoru": {
      "jp_character": "おどる",
      "romanji": [
        "odoru"
      ],
      "sound": "おどる",
      "meaning": "to dance",
      "meaning_id": "menari",
      "tags": ["verbs", "activities"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "だ",
        "ら"
      ]
    },
    "matsu": {
      "jp_character": "まつ",
      "romanji": [
        "matsu"
      ],
      "sound": "まつ",
      "meaning": "to wait",
      "meaning_id": "menunggu",
      "tags": ["verbs", "daily_life"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "た"
      ]
    },
    "tsukau": {
      "jp_character": "つかう",
      "romanji": [
        "tsukau"
      ],
      "sound": "つかう",
      "meaning": "to use",
      "meaning_id": "memakai",
      "tags": ["verbs", "daily_life"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "か",
        "あ"
      ]
    },
    "wasureru": {
      "jp_character": "わすれる",
      "romanji": [
        "wasureru"
      ],
      "sound": "わすれる",
      "meaning": "to forget",
      "meaning_id": "lupa",
      "tags": ["verbs", "understanding"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "さ",
        "ら"
      ]
    },
    "oboeru": {
      "jp_character": "おぼえる",
      "romanji": [
        "oboeru"
      ],
      "sound": "おぼえる",
      "meaning": "to remember / to memorize",
      "meaning_id": "mengingat / menghafal",
      "tags": ["verbs", "understanding"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "ば",
        "ら"
      ]
    },
    "shiru": {
      "jp_character": "しる",
      "romanji": [
        "shiru"
      ],
      "sound": "しる",
      "meaning": "to know",
      "meaning_id": "tahu",
      "tags": ["verbs", "understanding"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "ら"
      ]
    },
    "omou": {
      "jp_character": "おもう",
      "romanji": [
        "omou"
      ],
      "sound": "おもう",
      "meaning": "to think",
      "meaning_id": "berpikir",
      "tags": ["verbs", "understanding"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "ま"
      ]
    },
    "narau": {
      "jp_character": "ならう",
      "romanji": [
        "narau"
      ],
      "sound": "ならう",
      "meaning": "to learn",
      "meaning_id": "belajar",
      "tags": ["verbs", "understanding"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "ら",
        "あ"
      ]
    },
    "oshieru": {
      "jp_character": "おしえる",
      "romanji": [
        "oshieru"
      ],
      "sound": "おしえる",
      "meaning": "to teach",
      "meaning_id": "mengajar",
      "tags": ["verbs", "communication"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ",
        "ら"
      ]
    },
    "yobu": {
      "jp_character": "よぶ",
      "romanji": [
        "yobu"
      ],
      "sound": "よぶ",
      "meaning": "to call",
      "meaning_id": "memanggil",
      "tags": ["verbs", "communication"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ば"
      ]
    },
    "suwaru": {
      "jp_character": "すわる",
      "romanji": [
        "suwaru"
      ],
      "sound": "すわる",
      "meaning": "to sit",
      "meaning_id": "duduk",
      "tags": ["verbs", "movement"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "わ",
        "ら"
      ]
    },
    "tatsu": {
      "jp_character": "たつ",
      "romanji": [
        "tatsu"
      ],
      "sound": "たつ",
      "meaning": "to stand",
      "meaning_id": "berdiri",
      "tags": ["verbs", "movement"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た"
      ]
    },
    "hairu": {
      "jp_character": "はいる",
      "romanji": [
        "hairu"
      ],
      "sound": "はいる",
      "meaning": "to enter",
      "meaning_id": "masuk",
      "tags": ["verbs", "movement"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "あ",
        "ら"
      ]
    },
    "deru": {
      "jp_character": "でる",
      "romanji": [
        "deru"
      ],
      "sound": "でる",
      "meaning": "to leave / to go out",
      "meaning_id": "keluar",
      "tags": ["verbs", "movement"],
      "katakana_groups": [],
      "hiragana_groups": [
        "だ",
        "ら"
      ]
    },
    "isogu": {
      "jp_character": "いそぐ",
      "romanji": [
        "isogu"
      ],
      "sound": "いそぐ",
      "meaning": "to hurry",
      "meaning_id": "bergegas",
      "tags": ["verbs", "movement"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ",
        "が"
      ]
    },
    "akeru": {
      "jp_character": "あける",
      "romanji": [
        "akeru"
      ],
      "sound": "あける",
      "meaning": "to open",
      "meaning_id": "membuka",
      "tags": ["verbs", "daily_life"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "ら"
      ]
    },
    "shimeru": {
      "jp_character": "しめる",
      "romanji": [
        "shimeru"
      ],
      "sound": "しめる",
      "meaning": "to close",
      "meaning_id": "menutup",
      "tags": ["verbs", "daily_life"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "ま",
        "ら"
      ]
    },
    "motsu": {
      "jp_character": "もつ",
      "romanji": [
        "motsu"
      ],
      "sound": "もつ",
      "meaning": "to hold / to carry",
      "meaning_id": "memegang / membawa",
      "tags": ["verbs", "daily_life"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "た"
      ]
    },
    "nugu": {
      "jp_character": "ぬぐ",
      "romanji": [
        "nugu"
      ],
      "sound": "ぬぐ",
      "meaning": "to take off (clothes)",
      "meaning_id": "melepas (pakaian)",
      "tags": ["verbs", "daily_life"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "が"
      ]
    },
    "erabu": {
      "jp_character": "えらぶ",
      "romanji": [
        "erabu"
      ],
      "sound": "えらぶ",
      "meaning": "to choose",
      "meaning_id": "memilih",
      "tags": ["verbs", "daily_life"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "ら",
        "ば"
      ]
    },
    "yasumu": {
      "jp_character": "やすむ",
      "romanji": [
        "yasumu"
      ],
      "sound": "やすむ",
      "meaning": "to rest",
      "meaning_id": "beristirahat",
      "tags": ["verbs", "daily_life"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "さ",
        "ま"
      ]
    },
    "hataraku": {
      "jp_character": "はたらく",
      "romanji": [
        "hataraku"
      ],
      "sound": "はたらく",
      "meaning": "to work",
      "meaning_id": "bekerja",
      "tags": ["verbs", "work"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "た",
        "ら",
        "か"
      ]
    },
    "warau": {
      "jp_character": "わらう",
      "romanji": [
        "warau"
      ],
      "sound": "わらう",
      "meaning": "to laugh",
      "meaning_id": "tertawa",
      "tags": ["verbs", "social"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "ら",
        "あ"
      ]
    },
    "naku": {
      "jp_character": "なく",
      "romanji": [
        "naku"
      ],
      "sound": "なく",
      "meaning": "to cry",
      "meaning_id": "menangis",
      "tags": ["verbs", "feelings"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "か"
      ]
    },
    "tetsudau": {
      "jp_character": "てつだう",
      "romanji": [
        "tetsudau"
      ],
      "sound": "てつだう",
      "meaning": "to help",
      "meaning_id": "membantu",
      "tags": ["verbs", "social"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "だ",
        "あ"
      ]
    },
    "ganbaru": {
      "jp_character": "がんばる",
      "romanji": [
        "ganbaru"
      ],
      "sound": "がんばる",
      "meaning": "to do one's best",
      "meaning_id": "berusaha keras",
      "tags": ["verbs", "encouragement"],
      "katakana_groups": [],
      "hiragana_groups": [
        "が",
        "わ",
        "ば",
        "ら"
      ]
    },
    "kurai": {
      "jp_character": "くらい",
      "romanji": [
        "kurai"
      ],
      "sound": "くらい",
      "meaning": "dark",
      "meaning_id": "gelap",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "ら",
        "あ"
      ]
    },
    "isogashii": {
      "jp_character": "いそがしい",
      "romanji": [
        "isogashii"
      ],
      "sound": "いそがしい",
      "meaning": "busy",
      "meaning_id": "sibuk",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ",
        "が"
      ]
    },
    "hima": {
      "jp_character": "ひま",
      "romanji": [
        "hima"
      ],
      "sound": "ひま",
      "meaning": "free (not busy)",
      "meaning_id": "senggang",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "ま"
      ]
    },
    "nigiyaka": {
      "jp_character": "にぎやか",
      "romanji": [
        "nigiyaka"
      ],
      "sound": "にぎやか",
      "meaning": "lively",
      "meaning_id": "ramai",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "が",
        "や",
        "か"
      ]
    },
    "yuumei": {
      "jp_character": "ゆうめい",
      "romanji": [
        "yuumei",
        "yumei"
      ],
      "sound": "ゆうめい",
      "meaning": "famous",
      "meaning_id": "terkenal",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "ま"
      ]
    },
    "taihen": {
      "jp_character": "たいへん",
      "romanji": [
        "taihen"
      ],
      "sound": "たいへん",
      "meaning": "tough / terrible",
      "meaning_id": "berat / gawat",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "あ",
        "は",
        "わ"
      ]
    },
    "hen": {
      "jp_character": "へん",
      "romanji": [
        "hen"
      ],
      "sound": "へん",
      "meaning": "strange",
      "meaning_id": "aneh",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "わ"
      ]
    },
    "kowai": {
      "jp_character": "こわい",
      "romanji": [
        "kowai"
      ],
      "sound": "こわい",
      "meaning": "scary",
      "meaning_id": "menakutkan",
      "tags": ["adjectives", "feelings"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "わ",
        "あ"
      ]
    },
    "nemui": {
      "jp_character": "ねむい",
      "romanji": [
        "nemui"
      ],
      "sound": "ねむい",
      "meaning": "sleepy",
      "meaning_id": "mengantuk",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "ま",
        "あ"
      ]
    },
    "abunai": {
      "jp_character": "あぶない",
      "romanji": [
        "abunai"
      ],
      "sound": "あぶない",
      "meaning": "dangerous",
      "meaning_id": "berbahaya",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "ば",
        "な"
      ]
    },
    "wakai": {
      "jp_character": "わかい",
      "romanji": [
        "wakai"
      ],
      "sound": "わかい",
      "meaning": "young",
      "meaning_id": "muda",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "わ",
        "か",
        "あ"
      ]
    },
    "tsumetai": {
      "jp_character": "つめたい",
      "romanji": [
        "tsumetai"
      ],
      "sound": "つめたい",
      "meaning": "cold (to the touch)",
      "meaning_id": "dingin (saat disentuh)",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "ま",
        "あ"
      ]
    },
    "atatakai": {
      "jp_character": "あたたかい",
      "romanji": [
        "atatakai"
      ],
      "sound": "あたたかい",
      "meaning": "warm",
      "meaning_id": "hangat",
      "tags": ["weather", "adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "た",
        "か"
      ]
    },
    "amai": {
      "jp_character": "あまい",
      "romanji": [
        "amai"
      ],
      "sound": "あまい",
      "meaning": "sweet",
      "meaning_id": "manis",
      "tags": ["adjectives", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "ま"
      ]
    },
    "karai": {
      "jp_character": "からい",
      "romanji": [
        "karai"
      ],
      "sound": "からい",
      "meaning": "spicy",
      "meaning_id": "pedas",
      "tags": ["adjectives", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "ら",
        "あ"
      ]
    },
    "shoppai": {
      "jp_character": "しょっぱい",
      "romanji": [
        "shoppai"
      ],
      "sound": "しょっぱい",
      "meaning": "salty",
      "meaning_id": "asin",
      "tags": ["adjectives", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "や",
        "た",
        "ぱ",
        "あ"
      ]
    },
    "nigai": {
      "jp_character": "にがい",
      "romanji": [
        "nigai"
      ],
      "sound": "にがい",
      "meaning": "bitter",
      "meaning_id": "pahit",
      "tags": ["adjectives", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "が",
        "あ"
      ]
    },
    "suppai": {
      "jp_character": "すっぱい",
      "romanji": [
        "suppai"
      ],
      "sound": "すっぱい",
      "meaning": "sour",
      "meaning_id": "asam",
      "tags": ["adjectives", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "た",
        "ぱ",
        "あ"
      ]
    },
    "marui": {
      "jp_character": "まるい",
      "romanji": [
        "marui"
      ],
      "sound": "まるい",
      "meaning": "round",
      "meaning_id": "bulat",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "ら",
        "あ"
      ]
    },
    "hosoi": {
      "jp_character": "ほそい",
      "romanji": [
        "hosoi"
      ],
      "sound": "ほそい",
      "meaning": "thin / slender",
      "meaning_id": "ramping / tipis",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "さ",
        "あ"
      ]
    },
    "futoi": {
      "jp_character": "ふとい",
      "romanji": [
        "futoi"
      ],
      "sound": "ふとい",
      "meaning": "thick / fat",
      "meaning_id": "tebal / gemuk",
      "tags": ["adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "た",
        "あ"
      ]
    },
    "sabishii": {
      "jp_character": "さびしい",
      "romanji": [
        "sabishii"
      ],
      "sound": "さびしい",
      "meaning": "lonely",
      "meaning_id": "kesepian",
      "tags": ["feelings", "adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "ば",
        "あ"
      ]
    },
    "hazukashii": {
      "jp_character": "はずかしい",
      "romanji": [
        "hazukashii"
      ],
      "sound": "はずかしい",
      "meaning": "embarrassed",
      "meaning_id": "malu",
      "tags": ["feelings", "adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "ざ",
        "か",
        "さ",
        "あ"
      ]
    },
    "natsukashii": {
      "jp_character": "なつかしい",
      "romanji": [
        "natsukashii"
      ],
      "sound": "なつかしい",
      "meaning": "nostalgic",
      "meaning_id": "rindu (nostalgia)",
      "tags": ["feelings", "adjectives"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "た",
        "か",
        "さ",
        "あ"
      ]
    },
    "ushi": {
      "jp_character": "うし",
      "romanji": [
        "ushi"
      ],
      "sound": "うし",
      "meaning": "cow",
      "meaning_id": "sapi",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ"
      ]
    },
    "saru": {
      "jp_character": "さる",
      "romanji": [
        "saru"
      ],
      "sound": "さる",
      "meaning": "monkey",
      "meaning_id": "monyet",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "ら"
      ]
    },
    "kuma": {
      "jp_character": "くま",
      "romanji": [
        "kuma"
      ],
      "sound": "くま",
      "meaning": "bear",
      "meaning_id": "beruang",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "ま"
      ]
    },
    "usagi": {
      "jp_character": "うさぎ",
      "romanji": [
        "usagi"
      ],
      "sound": "うさぎ",
      "meaning": "rabbit",
      "meaning_id": "kelinci",
      "tags": ["animals", "pets"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ",
        "が"
      ]
    },
    "kitsune": {
      "jp_character": "きつね",
      "romanji": [
        "kitsune"
      ],
      "sound": "きつね",
      "meaning": "fox",
      "meaning_id": "rubah",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "た",
        "な"
      ]
    },
    "tanuki": {
      "jp_character": "たぬき",
      "romanji": [
        "tanuki"
      ],
      "sound": "たぬき",
      "meaning": "raccoon dog",
      "meaning_id": "tanuki (anjing rakun)",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "な",
        "か"
      ]
    },
    "nezumi": {
      "jp_character": "ねずみ",
      "romanji": [
        "nezumi"
      ],
      "sound": "ねずみ",
      "meaning": "mouse / rat",
      "meaning_id": "tikus",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "ざ",
        "ま"
      ]
    },
    "kame": {
      "jp_character": "かめ",
      "romanji": [
        "kame"
      ],
      "sound": "かめ",
      "meaning": "turtle",
      "meaning_id": "kura-kura",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "ま"
      ]
    },
    "hebi": {
      "jp_character": "へび",
      "romanji": [
        "hebi"
      ],
      "sound": "へび",
      "meaning": "snake",
      "meaning_id": "ular",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "ば"
      ]
    },
    "zou": {
      "jp_character": "ぞう",
      "romanji": [
        "zou",
        "zo"
      ],
      "sound": "ぞう",
      "meaning": "elephant",
      "meaning_id": "gajah",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ざ",
        "あ"
      ]
    },
    "kirin": {
      "jp_character": "きりん",
      "romanji": [
        "kirin"
      ],
      "sound": "きりん",
      "meaning": "giraffe",
      "meaning_id": "jerapah",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "ら",
        "わ"
      ]
    },
    "tora": {
      "jp_character": "とら",
      "romanji": [
        "tora"
      ],
      "sound": "とら",
      "meaning": "tiger",
      "meaning_id": "harimau",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "ら"
      ]
    },
    "ari": {
      "jp_character": "あり",
      "romanji": [
        "ari"
      ],
      "sound": "あり",
      "meaning": "ant",
      "meaning_id": "semut",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "ら"
      ]
    },
    "chou": {
      "jp_character": "ちょう",
      "romanji": [
        "chou",
        "cho"
      ],
      "sound": "ちょう",
      "meaning": "butterfly",
      "meaning_id": "kupu-kupu",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "や",
        "あ"
      ]
    },
    "tako": {
      "jp_character": "たこ",
      "romanji": [
        "tako"
      ],
      "sound": "たこ",
      "meaning": "octopus",
      "meaning_id": "gurita",
      "tags": ["animals", "seafood"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "か"
      ]
    },
    "kujira": {
      "jp_character": "くじら",
      "romanji": [
        "kujira"
      ],
      "sound": "くじら",
      "meaning": "whale",
      "meaning_id": "paus",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "ざ",
        "ら"
      ]
    },
    "iruka": {
      "jp_character": "いるか",
      "romanji": [
        "iruka"
      ],
      "sound": "いるか",
      "meaning": "dolphin",
      "meaning_id": "lumba-lumba",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "ら",
        "か"
      ]
    },
    "ahiru": {
      "jp_character": "あひる",
      "romanji": [
        "ahiru"
      ],
      "sound": "あひる",
      "meaning": "duck",
      "meaning_id": "bebek",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "は",
        "ら"
      ]
    },
    "karasu": {
      "jp_character": "からす",
      "romanji": [
        "karasu"
      ],
      "sound": "からす",
      "meaning": "crow",
      "meaning_id": "gagak",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "ら",
        "さ"
      ]
    },
    "niwatori": {
      "jp_character": "にわとり",
      "romanji": [
        "niwatori"
      ],
      "sound": "にわとり",
      "meaning": "chicken",
      "meaning_id": "ayam",
      "tags": ["animals"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "わ",
        "た",
        "ら"
      ]
    },
    "raion": {
      "jp_character": "ライオン",
      "romanji": [
        "raion"
      ],
      "sound": "ライオン",
      "meaning": "lion",
      "meaning_id": "singa",
      "tags": ["animals"],
      "katakana_groups": [
        "ラ",
        "ア",
        "ワ"
      ],
      "hiragana_groups": []
    },
    "panda": {
      "jp_character": "パンダ",
      "romanji": [
        "panda"
      ],
      "sound": "パンダ",
      "meaning": "panda",
      "meaning_id": "panda",
      "tags": ["animals"],
      "katakana_groups": [
        "パ",
        "ワ",
        "ダ"
      ],
      "hiragana_groups": []
    },
    "pengin": {
      "jp_character": "ペンギン",
      "romanji": [
        "pengin"
      ],
      "sound": "ペンギン",
      "meaning": "penguin",
      "meaning_id": "penguin",
      "tags": ["animals"],
      "katakana_groups": [
        "パ",
        "ワ",
        "ガ"
      ],
      "hiragana_groups": []
    },
    "kao": {
      "jp_character": "かお",
      "romanji": [
        "kao"
      ],
      "sound": "かお",
      "meaning": "face",
      "meaning_id": "wajah",
      "tags": ["body_parts"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "あ"
      ]
    },
    "kubi": {
      "jp_character": "くび",
      "romanji": [
        "kubi"
      ],
      "sound": "くび",
      "meaning": "neck",
      "meaning_id": "leher",
      "tags": ["body_parts"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "ば"
      ]
    },
    "kata": {
      "jp_character": "かた",
      "romanji": [
        "kata"
      ],
      "sound": "かた",
      "meaning": "shoulder",
      "meaning_id": "bahu",
      "tags": ["body_parts"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "た"
      ]
    },
    "senaka": {
      "jp_character": "せなか",
      "romanji": [
        "senaka"
      ],
      "sound": "せなか",
      "meaning": "back",
      "meaning_id": "punggung",
      "tags": ["body_parts"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "な",
        "か"
      ]
    },
    "yubi": {
      "jp_character": "ゆび",
      "romanji": [
        "yubi"
      ],
      "sound": "ゆび",
      "meaning": "finger",
      "meaning_id": "jari",
      "tags": ["body_parts"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ば"
      ]
    },
    "hiza": {
      "jp_character": "ひざ",
      "romanji": [
        "hiza"
      ],
      "sound": "ひざ",
      "meaning": "knee",
      "meaning_id": "lutut",
      "tags": ["body_parts"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "ざ"
      ]
    },
    "mune": {
      "jp_character": "むね",
      "romanji": [
        "mune"
      ],
      "sound": "むね",
      "meaning": "chest",
      "meaning_id": "dada",
      "tags": ["body_parts"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "な"
      ]
    },
    "kumo": {
      "jp_character": "くも",
      "romanji": [
        "kumo"
      ],
      "sound": "くも",
      "meaning": "cloud / spider",
      "meaning_id": "awan / laba-laba",
      "tags": ["nature", "weather"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "ま"
      ]
    },
    "mori": {
      "jp_character": "もり",
      "romanji": [
        "mori"
      ],
      "sound": "もり",
      "meaning": "forest",
      "meaning_id": "hutan",
      "tags": ["nature"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "ら"
      ]
    },
    "ki": {
      "jp_character": "き",
      "romanji": [
        "ki"
      ],
      "sound": "き",
      "meaning": "tree",
      "meaning_id": "pohon",
      "tags": ["nature"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か"
      ]
    },
    "ishi": {
      "jp_character": "いし",
      "romanji": [
        "ishi"
      ],
      "sound": "いし",
      "meaning": "stone",
      "meaning_id": "batu",
      "tags": ["nature"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ"
      ]
    },
    "shima": {
      "jp_character": "しま",
      "romanji": [
        "shima"
      ],
      "sound": "しま",
      "meaning": "island",
      "meaning_id": "pulau",
      "tags": ["nature", "places"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "ま"
      ]
    },
    "mizuumi": {
      "jp_character": "みずうみ",
      "romanji": [
        "mizuumi"
      ],
      "sound": "みずうみ",
      "meaning": "lake",
      "meaning_id": "danau",
      "tags": ["nature", "places"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "ざ",
        "あ"
      ]
    },
    "kaminari": {
      "jp_character": "かみなり",
      "romanji": [
        "kaminari"
      ],
      "sound": "かみなり",
      "meaning": "thunder",
      "meaning_id": "petir",
      "tags": ["weather", "nature"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "ま",
        "な",
        "ら"
      ]
    },
    "niji": {
      "jp_character": "にじ",
      "romanji": [
        "niji"
      ],
      "sound": "にじ",
      "meaning": "rainbow",
      "meaning_id": "pelangi",
      "tags": ["weather", "nature"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "ざ"
      ]
    },
    "sakura": {
      "jp_character": "さくら",
      "romanji": [
        "sakura"
      ],
      "sound": "さくら",
      "meaning": "cherry blossom",
      "meaning_id": "bunga sakura",
      "tags": ["nature", "flowers"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "か",
        "ら"
      ]
    },
    "hare": {
      "jp_character": "はれ",
      "romanji": [
        "hare"
      ],
      "sound": "はれ",
      "meaning": "sunny weather",
      "meaning_id": "cuaca cerah",
      "tags": ["weather"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "ら"
      ]
    },
    "kumori": {
      "jp_character": "くもり",
      "romanji": [
        "kumori"
      ],
      "sound": "くもり",
      "meaning": "cloudy weather",
      "meaning_id": "cuaca berawan",
      "tags": ["weather"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "ま",
        "ら"
      ]
    },
    "taifuu": {
      "jp_character": "たいふう",
      "romanji": [
        "taifuu",
        "taifu"
      ],
      "sound": "たいふう",
      "meaning": "typhoon",
      "meaning_id": "topan",
      "tags": ["weather"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "あ",
        "は"
      ]
    },
    "gyuunyuu": {
      "jp_character": "ぎゅうにゅう",
      "romanji": [
        "gyuunyuu",
        "gyunyu"
      ],
      "sound": "ぎゅうにゅう",
      "meaning": "milk",
      "meaning_id": "susu sapi",
      "tags": ["food", "drinks"],
      "katakana_groups": [],
      "hiragana_groups": [
        "が",
        "や",
        "あ",
        "な"
      ]
    },
    "onigiri": {
      "jp_character": "おにぎり",
      "romanji": [
        "onigiri"
      ],
      "sound": "おにぎり",
      "meaning": "rice ball",
      "meaning_id": "nasi kepal",
      "tags": ["food", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "な",
        "が",
        "ら"
      ]
    },
    "miso": {
      "jp_character": "みそ",
      "romanji": [
        "miso"
      ],
      "sound": "みそ",
      "meaning": "miso",
      "meaning_id": "miso",
      "tags": ["food", "condiments"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "さ"
      ]
    },
    "nattou": {
      "jp_character": "なっとう",
      "romanji": [
        "nattou",
        "natto"
      ],
      "sound": "なっとう",
      "meaning": "fermented soybeans",
      "meaning_id": "natto (kedelai fermentasi)",
      "tags": ["food", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "た",
        "あ"
      ]
    },
    "mochi": {
      "jp_character": "もち",
      "romanji": [
        "mochi"
      ],
      "sound": "もち",
      "meaning": "rice cake",
      "meaning_id": "mochi (kue beras)",
      "tags": ["food", "sweets"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "た"
      ]
    },
    "dango": {
      "jp_character": "だんご",
      "romanji": [
        "dango"
      ],
      "sound": "だんご",
      "meaning": "sweet rice dumpling",
      "meaning_id": "dango (kue beras manis)",
      "tags": ["food", "sweets"],
      "katakana_groups": [],
      "hiragana_groups": [
        "だ",
        "わ",
        "が"
      ]
    },
    "senbei": {
      "jp_character": "せんべい",
      "romanji": [
        "senbei",
        "sembei"
      ],
      "sound": "せんべい",
      "meaning": "rice cracker",
      "meaning_id": "kerupuk beras",
      "tags": ["food", "sweets"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "わ",
        "ば",
        "あ"
      ]
    },
    "takoyaki": {
      "jp_character": "たこやき",
      "romanji": [
        "takoyaki"
      ],
      "sound": "たこやき",
      "meaning": "octopus balls",
      "meaning_id": "takoyaki (bola gurita)",
      "tags": ["food", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "か",
        "や"
      ]
    },
    "karaage": {
      "jp_character": "からあげ",
      "romanji": [
        "karaage"
      ],
      "sound": "からあげ",
      "meaning": "fried chicken",
      "meaning_id": "ayam goreng",
      "tags": ["food", "meat"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "ら",
        "あ",
        "が"
      ]
    },
    "sashimi": {
      "jp_character": "さしみ",
      "romanji": [
        "sashimi"
      ],
      "sound": "さしみ",
      "meaning": "sliced raw fish",
      "meaning_id": "sashimi (irisan ikan mentah)",
      "tags": ["food", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "ま"
      ]
    },
    "nori": {
      "jp_character": "のり",
      "romanji": [
        "nori"
      ],
      "sound": "のり",
      "meaning": "seaweed",
      "meaning_id": "rumput laut",
      "tags": ["food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "ら"
      ]
    },
    "toufu": {
      "jp_character": "とうふ",
      "romanji": [
        "toufu",
        "tofu"
      ],
      "sound": "とうふ",
      "meaning": "tofu",
      "meaning_id": "tahu",
      "tags": ["food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "あ",
        "は"
      ]
    },
    "remon": {
      "jp_character": "レモン",
      "romanji": [
        "remon"
      ],
      "sound": "レモン",
      "meaning": "lemon",
      "meaning_id": "lemon",
      "tags": ["food", "fruits"],
      "katakana_groups": [
        "ラ",
        "マ",
        "ワ"
      ],
      "hiragana_groups": []
    },
    "meron": {
      "jp_character": "メロン",
      "romanji": [
        "meron"
      ],
      "sound": "メロン",
      "meaning": "melon",
      "meaning_id": "melon",
      "tags": ["food", "fruits"],
      "katakana_groups": [
        "マ",
        "ラ",
        "ワ"
      ],
      "hiragana_groups": []
    },
    "ninjin": {
      "jp_character": "にんじん",
      "romanji": [
        "ninjin"
      ],
      "sound": "にんじん",
      "meaning": "carrot",
      "meaning_id": "wortel",
      "tags": ["food", "vegetables"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "わ",
        "ざ"
      ]
    },
    "tamanegi": {
      "jp_character": "たまねぎ",
      "romanji": [
        "tamanegi"
      ],
      "sound": "たまねぎ",
      "meaning": "onion",
      "meaning_id": "bawang bombai",
      "tags": ["food", "vegetables"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "ま",
        "な",
        "が"
      ]
    },
    "jagaimo": {
      "jp_character": "じゃがいも",
      "romanji": [
        "jagaimo"
      ],
      "sound": "じゃがいも",
      "meaning": "potato",
      "meaning_id": "kentang",
      "tags": ["food", "vegetables"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ざ",
        "や",
        "が",
        "あ",
        "ま"
      ]
    },
    "kyabetsu": {
      "jp_character": "キャベツ",
      "romanji": [
        "kyabetsu"
      ],
      "sound": "キャベツ",
      "meaning": "cabbage",
      "meaning_id": "kubis",
      "tags": ["food", "vegetables"],
      "katakana_groups": [
        "カ",
        "ヤ",
        "バ",
        "タ"
      ],
      "hiragana_groups": []
    },
    "aisu": {
      "jp_character": "アイス",
      "romanji": [
        "aisu"
      ],
      "sound": "アイス",
      "meaning": "ice cream",
      "meaning_id": "es krim",
      "tags": ["food", "sweets"],
      "katakana_groups": [
        "ア",
        "サ"
      ],
      "hiragana_groups": []
    },
    "chokoreeto": {
      "jp_character": "チョコレート",
      "romanji": [
        "chokoreeto",
        "chokore-to"
      ],
      "sound": "チョコレート",
      "meaning": "chocolate",
      "meaning_id": "cokelat",
      "tags": ["food", "sweets"],
      "katakana_groups": [
        "タ",
        "ヤ",
        "カ",
        "ラ"
      ],
      "hiragana_groups": []
    },
    "juusu": {
      "jp_character": "ジュース",
      "romanji": [
        "juusu",
        "ju-su",
        "jusu"
      ],
      "sound": "ジュース",
      "meaning": "juice",
      "meaning_id": "jus",
      "tags": ["food", "drinks"],
      "katakana_groups": [
        "ザ",
        "ヤ",
        "サ"
      ],
      "hiragana_groups": []
    },
    "wain": {
      "jp_character": "ワイン",
      "romanji": [
        "wain"
      ],
      "sound": "ワイン",
      "meaning": "wine",
      "meaning_id": "wine",
      "tags": ["food", "drinks"],
      "katakana_groups": [
        "ワ",
        "ア"
      ],
      "hiragana_groups": []
    },
    "sarada": {
      "jp_character": "サラダ",
      "romanji": [
        "sarada"
      ],
      "sound": "サラダ",
      "meaning": "salad",
      "meaning_id": "salad",
      "tags": ["food"],
      "katakana_groups": [
        "サ",
        "ラ",
        "ダ"
      ],
      "hiragana_groups": []
    },
    "hanbaagaa": {
      "jp_character": "ハンバーガー",
      "romanji": [
        "hanbaagaa",
        "hanba-ga-"
      ],
      "sound": "ハンバーガー",
      "meaning": "hamburger",
      "meaning_id": "hamburger",
      "tags": ["food"],
      "katakana_groups": [
        "ハ",
        "ワ",
        "バ",
        "ガ"
      ],
      "hiragana_groups": []
    },
    "reizouko": {
      "jp_character": "れいぞうこ",
      "romanji": [
        "reizouko",
        "reizoko"
      ],
      "sound": "れいぞうこ",
      "meaning": "refrigerator",
      "meaning_id": "kulkas",
      "tags": ["home", "items"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ",
        "ざ",
        "か"
      ]
    },
    "sumaho": {
      "jp_character": "スマホ",
      "romanji": [
        "sumaho"
      ],
      "sound": "スマホ",
      "meaning": "smartphone",
      "meaning_id": "ponsel pintar",
      "tags": ["items", "technology"],
      "katakana_groups": [
        "サ",
        "マ",
        "ハ"
      ],
      "hiragana_groups": []
    },
    "kamera": {
      "jp_character": "カメラ",
      "romanji": [
        "kamera"
      ],
      "sound": "カメラ",
      "meaning": "camera",
      "meaning_id": "kamera",
      "tags": ["items", "technology"],
      "katakana_groups": [
        "カ",
        "マ",
        "ラ"
      ],
      "hiragana_groups": []
    },
    "kagi": {
      "jp_character": "かぎ",
      "romanji": [
        "kagi"
      ],
      "sound": "かぎ",
      "meaning": "key",
      "meaning_id": "kunci",
      "tags": ["items"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "が"
      ]
    },
    "kasa": {
      "jp_character": "かさ",
      "romanji": [
        "kasa"
      ],
      "sound": "かさ",
      "meaning": "umbrella",
      "meaning_id": "payung",
      "tags": ["items"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "さ"
      ]
    },
    "nooto": {
      "jp_character": "ノート",
      "romanji": [
        "nooto",
        "no-to"
      ],
      "sound": "ノート",
      "meaning": "notebook",
      "meaning_id": "buku catatan",
      "tags": ["items", "education"],
      "katakana_groups": [
        "ナ",
        "タ"
      ],
      "hiragana_groups": []
    },
    "pen": {
      "jp_character": "ペン",
      "romanji": [
        "pen"
      ],
      "sound": "ペン",
      "meaning": "pen",
      "meaning_id": "pulpen",
      "tags": ["items", "education"],
      "katakana_groups": [
        "パ",
        "ワ"
      ],
      "hiragana_groups": []
    },
    "keshigomu": {
      "jp_character": "けしごむ",
      "romanji": [
        "keshigomu"
      ],
      "sound": "けしごむ",
      "meaning": "eraser",
      "meaning_id": "penghapus",
      "tags": ["items", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "さ",
        "が",
        "ま"
      ]
    },
    "hasami": {
      "jp_character": "はさみ",
      "romanji": [
        "hasami"
      ],
      "sound": "はさみ",
      "meaning": "scissors",
      "meaning_id": "gunting",
      "tags": ["items"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "さ",
        "ま"
      ]
    },
    "saifu": {
      "jp_character": "さいふ",
      "romanji": [
        "saifu"
      ],
      "sound": "さいふ",
      "meaning": "wallet",
      "meaning_id": "dompet",
      "tags": ["items", "money"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "あ",
        "は"
      ]
    },
    "koppu": {
      "jp_character": "コップ",
      "romanji": [
        "koppu"
      ],
      "sound": "コップ",
      "meaning": "cup / glass",
      "meaning_id": "gelas",
      "tags": ["items", "food"],
      "katakana_groups": [
        "カ",
        "タ",
        "パ"
      ],
      "hiragana_groups": []
    },
    "chawan": {
      "jp_character": "ちゃわん",
      "romanji": [
        "chawan"
      ],
      "sound": "ちゃわん",
      "meaning": "rice bowl",
      "meaning_id": "mangkuk nasi",
      "tags": ["items", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "や",
        "わ"
      ]
    },
    "kutsushita": {
      "jp_character": "くつした",
      "romanji": [
        "kutsushita"
      ],
      "sound": "くつした",
      "meaning": "socks",
      "meaning_id": "kaus kaki",
      "tags": ["clothing"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "た",
        "さ"
      ]
    },
    "tebukuro": {
      "jp_character": "てぶくろ",
      "romanji": [
        "tebukuro"
      ],
      "sound": "てぶくろ",
      "meaning": "gloves",
      "meaning_id": "sarung tangan",
      "tags": ["clothing", "accessories"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "ば",
        "か",
        "ら"
      ]
    },
    "sukaato": {
      "jp_character": "スカート",
      "romanji": [
        "sukaato",
        "suka-to"
      ],
      "sound": "スカート",
      "meaning": "skirt",
      "meaning_id": "rok",
      "tags": ["clothing"],
      "katakana_groups": [
        "サ",
        "カ",
        "タ"
      ],
      "hiragana_groups": []
    },
    "kimono": {
      "jp_character": "きもの",
      "romanji": [
        "kimono"
      ],
      "sound": "きもの",
      "meaning": "kimono",
      "meaning_id": "kimono",
      "tags": ["clothing", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "ま",
        "な"
      ]
    },
    "yukata": {
      "jp_character": "ゆかた",
      "romanji": [
        "yukata"
      ],
      "sound": "ゆかた",
      "meaning": "summer kimono",
      "meaning_id": "yukata (kimono musim panas)",
      "tags": ["clothing", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "か",
        "た"
      ]
    },
    "basu": {
      "jp_character": "バス",
      "romanji": [
        "basu"
      ],
      "sound": "バス",
      "meaning": "bus",
      "meaning_id": "bus",
      "tags": ["transportation"],
      "katakana_groups": [
        "バ",
        "サ"
      ],
      "hiragana_groups": []
    },
    "takushii": {
      "jp_character": "タクシー",
      "romanji": [
        "takushii",
        "takushi-",
        "takushi"
      ],
      "sound": "タクシー",
      "meaning": "taxi",
      "meaning_id": "taksi",
      "tags": ["transportation"],
      "katakana_groups": [
        "タ",
        "カ",
        "サ"
      ],
      "hiragana_groups": []
    },
    "chikatetsu": {
      "jp_character": "ちかてつ",
      "romanji": [
        "chikatetsu"
      ],
      "sound": "ちかてつ",
      "meaning": "subway",
      "meaning_id": "kereta bawah tanah",
      "tags": ["transportation"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "か"
      ]
    },
    "mise": {
      "jp_character": "みせ",
      "romanji": [
        "mise"
      ],
      "sound": "みせ",
      "meaning": "shop",
      "meaning_id": "toko",
      "tags": ["places", "shopping"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "さ"
      ]
    },
    "kuukou": {
      "jp_character": "くうこう",
      "romanji": [
        "kuukou",
        "kuko"
      ],
      "sound": "くうこう",
      "meaning": "airport",
      "meaning_id": "bandara",
      "tags": ["places", "transportation"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "あ"
      ]
    },
    "jinja": {
      "jp_character": "じんじゃ",
      "romanji": [
        "jinja"
      ],
      "sound": "じんじゃ",
      "meaning": "shrine",
      "meaning_id": "kuil Shinto",
      "tags": ["places", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ざ",
        "わ",
        "や"
      ]
    },
    "otera": {
      "jp_character": "おてら",
      "romanji": [
        "otera"
      ],
      "sound": "おてら",
      "meaning": "temple",
      "meaning_id": "kuil Buddha",
      "tags": ["places", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "た",
        "ら"
      ]
    },
    "mura": {
      "jp_character": "むら",
      "romanji": [
        "mura"
      ],
      "sound": "むら",
      "meaning": "village",
      "meaning_id": "desa",
      "tags": ["places"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "ら"
      ]
    },
    "suupaa": {
      "jp_character": "スーパー",
      "romanji": [
        "suupaa",
        "su-pa-"
      ],
      "sound": "スーパー",
      "meaning": "supermarket",
      "meaning_id": "supermarket",
      "tags": ["places", "shopping"],
      "katakana_groups": [
        "サ",
        "パ"
      ],
      "hiragana_groups": []
    },
    "daidokoro": {
      "jp_character": "だいどころ",
      "romanji": [
        "daidokoro"
      ],
      "sound": "だいどころ",
      "meaning": "kitchen",
      "meaning_id": "dapur",
      "tags": ["places", "home"],
      "katakana_groups": [],
      "hiragana_groups": [
        "だ",
        "あ",
        "か",
        "ら"
      ]
    },
    "niwa": {
      "jp_character": "にわ",
      "romanji": [
        "niwa"
      ],
      "sound": "にわ",
      "meaning": "garden",
      "meaning_id": "halaman / kebun",
      "tags": ["places", "home"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "わ"
      ]
    },
    "isha": {
      "jp_character": "いしゃ",
      "romanji": [
        "isha"
      ],
      "sound": "いしゃ",
      "meaning": "doctor",
      "meaning_id": "dokter",
      "tags": ["people", "work"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "さ",
        "や"
      ]
    },
    "keisatsu": {
      "jp_character": "けいさつ",
      "romanji": [
        "keisatsu"
      ],
      "sound": "けいさつ",
      "meaning": "police",
      "meaning_id": "polisi",
      "tags": ["people", "work"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "あ",
        "さ",
        "た"
      ]
    },
    "otona": {
      "jp_character": "おとな",
      "romanji": [
        "otona"
      ],
      "sound": "おとな",
      "meaning": "adult",
      "meaning_id": "orang dewasa",
      "tags": ["people"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "た",
        "な"
      ]
    },
    "kazoku": {
      "jp_character": "かぞく",
      "romanji": [
        "kazoku"
      ],
      "sound": "かぞく",
      "meaning": "family",
      "meaning_id": "keluarga",
      "tags": ["family"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "ざ"
      ]
    },
    "okaasan": {
      "jp_character": "おかあさん",
      "romanji": [
        "okaasan",
        "okasan"
      ],
      "sound": "おかあさん",
      "meaning": "mother",
      "meaning_id": "ibu",
      "tags": ["family"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "さ",
        "わ"
      ]
    },
    "otousan": {
      "jp_character": "おとうさん",
      "romanji": [
        "otousan",
        "otosan"
      ],
      "sound": "おとうさん",
      "meaning": "father",
      "meaning_id": "ayah",
      "tags": ["family"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "た",
        "さ",
        "わ"
      ]
    },
    "oniisan": {
      "jp_character": "おにいさん",
      "romanji": [
        "oniisan",
        "onisan"
      ],
      "sound": "おにいさん",
      "meaning": "older brother",
      "meaning_id": "kakak laki-laki",
      "tags": ["family"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "な",
        "さ",
        "わ"
      ]
    },
    "oneesan": {
      "jp_character": "おねえさん",
      "romanji": [
        "oneesan",
        "onesan"
      ],
      "sound": "おねえさん",
      "meaning": "older sister",
      "meaning_id": "kakak perempuan",
      "tags": ["family"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "な",
        "さ",
        "わ"
      ]
    },
    "ojiisan": {
      "jp_character": "おじいさん",
      "romanji": [
        "ojiisan"
      ],
      "sound": "おじいさん",
      "meaning": "grandfather",
      "meaning_id": "kakek",
      "tags": ["family"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "ざ",
        "さ",
        "わ"
      ]
    },
    "obaasan": {
      "jp_character": "おばあさん",
      "romanji": [
        "obaasan"
      ],
      "sound": "おばあさん",
      "meaning": "grandmother",
      "meaning_id": "nenek",
      "tags": ["family"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "ば",
        "さ",
        "わ"
      ]
    },
    "jikan": {
      "jp_character": "じかん",
      "romanji": [
        "jikan"
      ],
      "sound": "じかん",
      "meaning": "time / hour",
      "meaning_id": "waktu / jam",
      "tags": ["time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ざ",
        "か",
        "わ"
      ]
    },
    "shuumatsu": {
      "jp_character": "しゅうまつ",
      "romanji": [
        "shuumatsu",
        "shumatsu"
      ],
      "sound": "しゅうまつ",
      "meaning": "weekend",
      "meaning_id": "akhir pekan",
      "tags": ["time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "や",
        "あ",
        "ま",
        "た"
      ]
    },
    "raishuu": {
      "jp_character": "らいしゅう",
      "romanji": [
        "raishuu",
        "raishu"
      ],
      "sound": "らいしゅう",
      "meaning": "next week",
      "meaning_id": "minggu depan",
      "tags": ["time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ",
        "さ",
        "や"
      ]
    },
    "kotoshi": {
      "jp_character": "ことし",
      "romanji": [
        "kotoshi"
      ],
      "sound": "ことし",
      "meaning": "this year",
      "meaning_id": "tahun ini",
      "tags": ["time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "た",
        "さ"
      ]
    },
    "rainen": {
      "jp_character": "らいねん",
      "romanji": [
        "rainen"
      ],
      "sound": "らいねん",
      "meaning": "next year",
      "meaning_id": "tahun depan",
      "tags": ["time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "あ",
        "な",
        "わ"
      ]
    },
    "aka": {
      "jp_character": "あか",
      "romanji": [
        "aka"
      ],
      "sound": "あか",
      "meaning": "red",
      "meaning_id": "merah",
      "tags": ["colors"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か"
      ]
    },
    "murasaki": {
      "jp_character": "むらさき",
      "romanji": [
        "murasaki"
      ],
      "sound": "むらさき",
      "meaning": "purple",
      "meaning_id": "ungu",
      "tags": ["colors"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "ら",
        "さ",
        "か"
      ]
    },
    "haiiro": {
      "jp_character": "はいいろ",
      "romanji": [
        "haiiro"
      ],
      "sound": "はいいろ",
      "meaning": "gray",
      "meaning_id": "abu-abu",
      "tags": ["colors"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "あ",
        "ら"
      ]
    },
    "pinku": {
      "jp_character": "ピンク",
      "romanji": [
        "pinku"
      ],
      "sound": "ピンク",
      "meaning": "pink",
      "meaning_id": "merah muda",
      "tags": ["colors"],
      "katakana_groups": [
        "パ",
        "ワ",
        "カ"
      ],
      "hiragana_groups": []
    },
    "orenji": {
      "jp_character": "オレンジ",
      "romanji": [
        "orenji"
      ],
      "sound": "オレンジ",
      "meaning": "orange",
      "meaning_id": "oranye",
      "tags": ["colors", "fruits"],
      "katakana_groups": [
        "ア",
        "ラ",
        "ワ",
        "ザ"
      ],
      "hiragana_groups": []
    },
    "yoko": {
      "jp_character": "よこ",
      "romanji": [
        "yoko"
      ],
      "sound": "よこ",
      "meaning": "side / next to",
      "meaning_id": "samping",
      "tags": ["directions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "か"
      ]
    },
    "chikaku": {
      "jp_character": "ちかく",
      "romanji": [
        "chikaku"
      ],
      "sound": "ちかく",
      "meaning": "nearby",
      "meaning_id": "dekat sini",
      "tags": ["directions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "か"
      ]
    },
    "kita": {
      "jp_character": "きた",
      "romanji": [
        "kita"
      ],
      "sound": "きた",
      "meaning": "north",
      "meaning_id": "utara",
      "tags": ["directions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "た"
      ]
    },
    "minami": {
      "jp_character": "みなみ",
      "romanji": [
        "minami"
      ],
      "sound": "みなみ",
      "meaning": "south",
      "meaning_id": "selatan",
      "tags": ["directions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "な"
      ]
    },
    "higashi": {
      "jp_character": "ひがし",
      "romanji": [
        "higashi"
      ],
      "sound": "ひがし",
      "meaning": "east",
      "meaning_id": "timur",
      "tags": ["directions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "が",
        "さ"
      ]
    },
    "nishi": {
      "jp_character": "にし",
      "romanji": [
        "nishi"
      ],
      "sound": "にし",
      "meaning": "west",
      "meaning_id": "barat",
      "tags": ["directions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "さ"
      ]
    },
    "gomennasai": {
      "jp_character": "ごめんなさい",
      "romanji": [
        "gomennasai"
      ],
      "sound": "ごめんなさい",
      "meaning": "I'm sorry",
      "meaning_id": "maafkan aku",
      "tags": ["expressions", "politeness"],
      "katakana_groups": [],
      "hiragana_groups": [
        "が",
        "ま",
        "わ",
        "な",
        "さ",
        "あ"
      ]
    },
    "hajimemashite": {
      "jp_character": "はじめまして",
      "romanji": [
        "hajimemashite"
      ],
      "sound": "はじめまして",
      "meaning": "nice to meet you",
      "meaning_id": "senang berkenalan",
      "tags": ["expressions", "greetings"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "ざ",
        "ま",
        "さ",
        "た"
      ]
    },
    "yoroshiku": {
      "jp_character": "よろしく",
      "romanji": [
        "yoroshiku"
      ],
      "sound": "よろしく",
      "meaning": "please treat me well",
      "meaning_id": "mohon bantuannya",
      "tags": ["expressions", "greetings"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "ら",
        "さ",
        "か"
      ]
    },
    "douzo": {
      "jp_character": "どうぞ",
      "romanji": [
        "douzo",
        "dozo"
      ],
      "sound": "どうぞ",
      "meaning": "please / go ahead",
      "meaning_id": "silakan",
      "tags": ["expressions", "politeness"],
      "katakana_groups": [],
      "hiragana_groups": [
        "だ",
        "あ",
        "ざ"
      ]
    },
    "onegaishimasu": {
      "jp_character": "おねがいします",
      "romanji": [
        "onegaishimasu",
        "onegai shimasu"
      ],
      "sound": "おねがいします",
      "meaning": "please (request)",
      "meaning_id": "tolong (permintaan)",
      "tags": ["expressions", "politeness"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "な",
        "が",
        "さ",
        "ま"
      ]
    },
    "irasshaimase": {
      "jp_character": "いらっしゃいませ",
      "romanji": [
        "irasshaimase"
      ],
      "sound": "いらっしゃいませ",
      "meaning": "welcome (to a shop)",
      "meaning_id": "selamat datang (di toko)",
      "tags": ["expressions", "shopping"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "ら",
        "た",
        "さ",
        "や",
        "ま"
      ]
    },
    "ittekimasu": {
      "jp_character": "いってきます",
      "romanji": [
        "ittekimasu"
      ],
      "sound": "いってきます",
      "meaning": "I'm off (leaving home)",
      "meaning_id": "aku berangkat",
      "tags": ["expressions", "greetings"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "た",
        "か",
        "ま",
        "さ"
      ]
    },
    "tadaima": {
      "jp_character": "ただいま",
      "romanji": [
        "tadaima"
      ],
      "sound": "ただいま",
      "meaning": "I'm home",
      "meaning_id": "aku pulang",
      "tags": ["expressions", "greetings"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "だ",
        "あ",
        "ま"
      ]
    },
    "okaeri": {
      "jp_character": "おかえり",
      "romanji": [
        "okaeri"
      ],
      "sound": "おかえり",
      "meaning": "welcome home",
      "meaning_id": "selamat datang di rumah",
      "tags": ["expressions", "greetings"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "か",
        "ら"
      ]
    },
    "naruhodo": {
      "jp_character": "なるほど",
      "romanji": [
        "naruhodo"
      ],
      "sound": "なるほど",
      "meaning": "I see",
      "meaning_id": "oh begitu",
      "tags": ["expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "ら",
        "は",
        "だ"
      ]
    },
    "mochiron": {
      "jp_character": "もちろん",
      "romanji": [
        "mochiron"
      ],
      "sound": "もちろん",
      "meaning": "of course",
      "meaning_id": "tentu saja",
      "tags": ["expressions"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "た",
        "ら",
        "わ"
      ]
    },
    "tabun": {
      "jp_character": "たぶん",
      "romanji": [
        "tabun"
      ],
      "sound": "たぶん",
      "meaning": "maybe / probably",
      "meaning_id": "mungkin",
      "tags": ["adverbs"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "ば",
        "わ"
      ]
    },
    "zenzen": {
      "jp_character": "ぜんぜん",
      "romanji": [
        "zenzen"
      ],
      "sound": "ぜんぜん",
      "meaning": "not at all",
      "meaning_id": "sama sekali tidak",
      "tags": ["adverbs"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ざ",
        "わ"
      ]
    },
    "mada": {
      "jp_character": "まだ",
      "romanji": [
        "mada"
      ],
      "sound": "まだ",
      "meaning": "still / not yet",
      "meaning_id": "masih / belum",
      "tags": ["adverbs", "time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "だ"
      ]
    },
    "itsumo": {
      "jp_character": "いつも",
      "romanji": [
        "itsumo"
      ],
      "sound": "いつも",
      "meaning": "always",
      "meaning_id": "selalu",
      "tags": ["adverbs", "time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "た",
        "ま"
      ]
    },
    "tokidoki": {
      "jp_character": "ときどき",
      "romanji": [
        "tokidoki"
      ],
      "sound": "ときどき",
      "meaning": "sometimes",
      "meaning_id": "kadang-kadang",
      "tags": ["adverbs", "time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "か",
        "だ"
      ]
    },
    "yukkuri": {
      "jp_character": "ゆっくり",
      "romanji": [
        "yukkuri"
      ],
      "sound": "ゆっくり",
      "meaning": "slowly",
      "meaning_id": "pelan-pelan",
      "tags": ["adverbs"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "た",
        "か",
        "ら"
      ]
    },
    "sugu": {
      "jp_character": "すぐ",
      "romanji": [
        "sugu"
      ],
      "sound": "すぐ",
      "meaning": "immediately",
      "meaning_id": "segera",
      "tags": ["adverbs", "time"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "が"
      ]
    },
    "issho": {
      "jp_character": "いっしょ",
      "romanji": [
        "issho"
      ],
      "sound": "いっしょ",
      "meaning": "together",
      "meaning_id": "bersama",
      "tags": ["adverbs"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "た",
        "さ",
        "や"
      ]
    },
    "hitori": {
      "jp_character": "ひとり",
      "romanji": [
        "hitori"
      ],
      "sound": "ひとり",
      "meaning": "alone / one person",
      "meaning_id": "sendirian / satu orang",
      "tags": ["people"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "た",
        "ら"
      ]
    },
    "otaku_2": {
      "jp_character": "おたく",
      "romanji": [
        "otaku"
      ],
      "sound": "おたく",
      "meaning": "otaku / geek",
      "meaning_id": "otaku",
      "tags": ["otaku"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "た",
        "か"
      ]
    },
    "matsuri": {
      "jp_character": "まつり",
      "romanji": [
        "matsuri"
      ],
      "sound": "まつり",
      "meaning": "festival",
      "meaning_id": "festival",
      "tags": ["events", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ま",
        "た",
        "ら"
      ]
    },
    "ninja": {
      "jp_character": "にんじゃ",
      "romanji": [
        "ninja"
      ],
      "sound": "にんじゃ",
      "meaning": "ninja",
      "meaning_id": "ninja",
      "tags": ["japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "な",
        "わ",
        "ざ",
        "や"
      ]
    },
    "samurai": {
      "jp_character": "さむらい",
      "romanji": [
        "samurai"
      ],
      "sound": "さむらい",
      "meaning": "samurai",
      "meaning_id": "samurai",
      "tags": ["japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "ま",
        "ら",
        "あ"
      ]
    },
    "tatami": {
      "jp_character": "たたみ",
      "romanji": [
        "tatami"
      ],
      "sound": "たたみ",
      "meaning": "straw floor mat",
      "meaning_id": "tikar jerami",
      "tags": ["home", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "た",
        "ま"
      ]
    },
    "kendou": {
      "jp_character": "けんどう",
      "romanji": [
        "kendou",
        "kendo"
      ],
      "sound": "けんどう",
      "meaning": "kendo",
      "meaning_id": "kendo",
      "tags": ["sports", "martial_arts", "japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "わ",
        "だ",
        "あ"
      ]
    },
    "oni": {
      "jp_character": "おに",
      "romanji": [
        "oni"
      ],
      "sound": "おに",
      "meaning": "demon / ogre",
      "meaning_id": "iblis / raksasa",
      "tags": ["japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "あ",
        "な"
      ]
    },
    "youkai": {
      "jp_character": "ようかい",
      "romanji": [
        "youkai",
        "yokai"
      ],
      "sound": "ようかい",
      "meaning": "supernatural monster",
      "meaning_id": "makhluk gaib",
      "tags": ["japanese_culture"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "あ",
        "か"
      ]
    },
    "sakkaa": {
      "jp_character": "サッカー",
      "romanji": [
        "sakkaa",
        "sakka-"
      ],
      "sound": "サッカー",
      "meaning": "soccer",
      "meaning_id": "sepak bola",
      "tags": ["sports"],
      "katakana_groups": [
        "サ",
        "タ",
        "カ"
      ],
      "hiragana_groups": []
    },
    "yakyuu": {
      "jp_character": "やきゅう",
      "romanji": [
        "yakyuu",
        "yakyu"
      ],
      "sound": "やきゅう",
      "meaning": "baseball",
      "meaning_id": "bisbol",
      "tags": ["sports"],
      "katakana_groups": [],
      "hiragana_groups": [
        "や",
        "か",
        "あ"
      ]
    },
    "tenisu": {
      "jp_character": "テニス",
      "romanji": [
        "tenisu"
      ],
      "sound": "テニス",
      "meaning": "tennis",
      "meaning_id": "tenis",
      "tags": ["sports"],
      "katakana_groups": [
        "タ",
        "ナ",
        "サ"
      ],
      "hiragana_groups": []
    },
    "suiei": {
      "jp_character": "すいえい",
      "romanji": [
        "suiei"
      ],
      "sound": "すいえい",
      "meaning": "swimming",
      "meaning_id": "renang",
      "tags": ["sports"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "あ"
      ]
    },
    "shashin": {
      "jp_character": "しゃしん",
      "romanji": [
        "shashin"
      ],
      "sound": "しゃしん",
      "meaning": "photograph",
      "meaning_id": "foto",
      "tags": ["hobbies"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "や",
        "わ"
      ]
    },
    "ryokou": {
      "jp_character": "りょこう",
      "romanji": [
        "ryokou",
        "ryoko"
      ],
      "sound": "りょこう",
      "meaning": "travel / trip",
      "meaning_id": "perjalanan / wisata",
      "tags": ["hobbies", "travel"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "や",
        "か",
        "あ"
      ]
    },
    "ryouri": {
      "jp_character": "りょうり",
      "romanji": [
        "ryouri",
        "ryori"
      ],
      "sound": "りょうり",
      "meaning": "cooking",
      "meaning_id": "masakan / memasak",
      "tags": ["hobbies", "food"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ら",
        "や",
        "あ"
      ]
    },
    "shukudai": {
      "jp_character": "しゅくだい",
      "romanji": [
        "shukudai"
      ],
      "sound": "しゅくだい",
      "meaning": "homework",
      "meaning_id": "PR",
      "tags": ["school", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "や",
        "か",
        "だ",
        "あ"
      ]
    },
    "shiken": {
      "jp_character": "しけん",
      "romanji": [
        "shiken"
      ],
      "sound": "しけん",
      "meaning": "exam",
      "meaning_id": "ujian",
      "tags": ["school", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "さ",
        "か",
        "わ"
      ]
    },
    "kyoukasho": {
      "jp_character": "きょうかしょ",
      "romanji": [
        "kyoukasho",
        "kyokasho"
      ],
      "sound": "きょうかしょ",
      "meaning": "textbook",
      "meaning_id": "buku pelajaran",
      "tags": ["school", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "や",
        "あ",
        "さ"
      ]
    },
    "jugyou": {
      "jp_character": "じゅぎょう",
      "romanji": [
        "jugyou",
        "jugyo"
      ],
      "sound": "じゅぎょう",
      "meaning": "class / lesson",
      "meaning_id": "pelajaran (di kelas)",
      "tags": ["school", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "ざ",
        "や",
        "が",
        "あ"
      ]
    },
    "kotoba": {
      "jp_character": "ことば",
      "romanji": [
        "kotoba"
      ],
      "sound": "ことば",
      "meaning": "word / language",
      "meaning_id": "kata / bahasa",
      "tags": ["languages", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "た",
        "ば"
      ]
    },
    "kanji": {
      "jp_character": "かんじ",
      "romanji": [
        "kanji"
      ],
      "sound": "かんじ",
      "meaning": "Chinese characters",
      "meaning_id": "kanji (huruf Tionghoa)",
      "tags": ["languages", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "か",
        "わ",
        "ざ"
      ]
    },
    "hiragana": {
      "jp_character": "ひらがな",
      "romanji": [
        "hiragana"
      ],
      "sound": "ひらがな",
      "meaning": "hiragana",
      "meaning_id": "hiragana",
      "tags": ["languages", "education"],
      "katakana_groups": [],
      "hiragana_groups": [
        "は",
        "ら",
        "が",
        "な"
      ]
    },
    "katakana": {
      "jp_character": "カタカナ",
      "romanji": [
        "katakana"
      ],
      "sound": "カタカナ",
      "meaning": "katakana",
      "meaning_id": "katakana",
      "tags": ["languages", "education"],
      "katakana_groups": [
        "カ",
        "タ",
        "ナ"
      ],
      "hiragana_groups": []
    }
  },
  "kanjiSource": {
    "n5-basics": {
      "title": "N5 Basics",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "person": {
          "jp_character": "人",
          "romanji": [
            "hito",
            "jin"
          ],
          "sound": "ひと",
          "meaning": "person",
          "meaning_id": "orang"
        },
        "sun": {
          "jp_character": "日",
          "romanji": [
            "hi",
            "nichi"
          ],
          "sound": "ひ",
          "meaning": "day / sun",
          "meaning_id": "hari / matahari"
        },
        "moon": {
          "jp_character": "月",
          "romanji": [
            "tsuki",
            "zuki",
            "getsu"
          ],
          "sound": "つき",
          "meaning": "moon / month",
          "meaning_id": "bulan / bulan"
        },
        "mountain": {
          "jp_character": "山",
          "romanji": [
            "yama",
            "san"
          ],
          "sound": "やま",
          "meaning": "mountain",
          "meaning_id": "gunung"
        },
        "river": {
          "jp_character": "川",
          "romanji": [
            "kawa",
            "sen"
          ],
          "sound": "かわ",
          "meaning": "river",
          "meaning_id": "sungai"
        }
      }
    },
    "n5-size": {
      "title": "N5 Size",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "big": {
          "jp_character": "大",
          "romanji": [
            "ooki",
            "dai"
          ],
          "sound": "おお",
          "meaning": "big",
          "meaning_id": "besar"
        },
        "small": {
          "jp_character": "小",
          "romanji": [
            "chiisai",
            "shou",
            "ko"
          ],
          "sound": "ちい",
          "meaning": "small",
          "meaning_id": "kecil"
        },
        "inside": {
          "jp_character": "中",
          "romanji": [
            "naka",
            "chuu"
          ],
          "sound": "なか",
          "meaning": "inside / middle",
          "meaning_id": "dalam / tengah"
        },
        "before": {
          "jp_character": "先",
          "romanji": [
            "saki",
            "sen"
          ],
          "sound": "さき",
          "meaning": "before / ahead",
          "meaning_id": "sebelum / depan"
        },
        "friend": {
          "jp_character": "友",
          "romanji": [
            "tomo"
          ],
          "sound": "とも",
          "meaning": "friend",
          "meaning_id": "teman"
        }
      }
    },
    "n5-school": {
      "title": "N5 School",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "study": {
          "jp_character": "学",
          "romanji": [
            "manabu",
            "gaku"
          ],
          "sound": "まな",
          "meaning": "study",
          "meaning_id": "belajar"
        },
        "life": {
          "jp_character": "生",
          "romanji": [
            "i",
            "sei",
            "nama"
          ],
          "sound": "い",
          "meaning": "life / birth",
          "meaning_id": "hidup / lahir"
        },
        "school": {
          "jp_character": "校",
          "romanji": [
            "kou"
          ],
          "sound": "こう",
          "meaning": "school",
          "meaning_id": "sekolah"
        },
        "store": {
          "jp_character": "店",
          "romanji": [
            "mise",
            "ten"
          ],
          "sound": "みせ",
          "meaning": "shop",
          "meaning_id": "toko"
        }
      }
    },
    "n5-nature": {
      "title": "N5 Nature",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "water": {
          "jp_character": "水",
          "romanji": [
            "mizu",
            "sui"
          ],
          "sound": "みず",
          "meaning": "water",
          "meaning_id": "air"
        },
        "tree": {
          "jp_character": "木",
          "romanji": [
            "ki",
            "moku"
          ],
          "sound": "き",
          "meaning": "tree",
          "meaning_id": "pohon"
        },
        "fire": {
          "jp_character": "火",
          "romanji": [
            "hi",
            "ka"
          ],
          "sound": "ひ",
          "meaning": "fire",
          "meaning_id": "api"
        },
        "earth": {
          "jp_character": "土",
          "romanji": [
            "tsuchi",
            "do"
          ],
          "sound": "つち",
          "meaning": "earth / soil",
          "meaning_id": "tanah"
        },
        "field": {
          "jp_character": "田",
          "romanji": [
            "ta",
            "den"
          ],
          "sound": "た",
          "meaning": "rice field",
          "meaning_id": "sawah"
        }
      }
    },
    "n5-body": {
      "title": "N5 Body",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "eye": {
          "jp_character": "目",
          "romanji": [
            "me",
            "moku"
          ],
          "sound": "め",
          "meaning": "eye",
          "meaning_id": "mata"
        },
        "ear": {
          "jp_character": "耳",
          "romanji": [
            "mimi",
            "ji"
          ],
          "sound": "みみ",
          "meaning": "ear",
          "meaning_id": "telinga"
        },
        "hand": {
          "jp_character": "手",
          "romanji": [
            "te",
            "shu"
          ],
          "sound": "て",
          "meaning": "hand",
          "meaning_id": "tangan"
        },
        "foot": {
          "jp_character": "足",
          "romanji": [
            "ashi",
            "soku"
          ],
          "sound": "あし",
          "meaning": "foot",
          "meaning_id": "kaki"
        },
        "mouth": {
          "jp_character": "口",
          "romanji": [
            "kuchi",
            "kou"
          ],
          "sound": "くち",
          "meaning": "mouth",
          "meaning_id": "mulut"
        }
      }
    },
    "n5-actions": {
      "title": "N5 Actions",
      "tags": [
        "main_kana"
      ],
      "characters": {
        "rest": {
          "jp_character": "休",
          "romanji": [
            "yasumu",
            "kyuu"
          ],
          "sound": "やす",
          "meaning": "rest",
          "meaning_id": "istirahat"
        },
        "eat": {
          "jp_character": "食",
          "romanji": [
            "taberu",
            "shoku"
          ],
          "sound": "た",
          "meaning": "eat / food",
          "meaning_id": "makan / makanan"
        },
        "drink": {
          "jp_character": "飲",
          "romanji": [
            "nomu",
            "in"
          ],
          "sound": "の",
          "meaning": "drink",
          "meaning_id": "minum"
        },
        "see": {
          "jp_character": "見",
          "romanji": [
            "miru",
            "ken"
          ],
          "sound": "み",
          "meaning": "see",
          "meaning_id": "lihat"
        },
        "go": {
          "jp_character": "行",
          "romanji": [
            "iku",
            "kou",
            "gyou"
          ],
          "sound": "い",
          "meaning": "go / travel",
          "meaning_id": "pergi / perjalanan"
        }
      }
    },
    "n5-numbers": {
      "title": "N5 Numbers",
      "tags": ["main_kana"],
      "characters": {
        "one": { "jp_character": "一", "romanji": ["ichi", "hitotsu"], "sound": "いち", "meaning": "one", "meaning_id": "satu" },
        "two": { "jp_character": "二", "romanji": ["ni", "futatsu"], "sound": "に", "meaning": "two", "meaning_id": "dua" },
        "three": { "jp_character": "三", "romanji": ["san", "mittsu"], "sound": "さん", "meaning": "three", "meaning_id": "tiga" },
        "four": { "jp_character": "四", "romanji": ["yon", "shi"], "sound": "よん", "meaning": "four", "meaning_id": "empat" },
        "five": { "jp_character": "五", "romanji": ["go", "itsutsu"], "sound": "ご", "meaning": "five", "meaning_id": "lima" },
        "six": { "jp_character": "六", "romanji": ["roku", "muttsu"], "sound": "ろく", "meaning": "six", "meaning_id": "enam" },
        "seven": { "jp_character": "七", "romanji": ["nana", "shichi"], "sound": "なな", "meaning": "seven", "meaning_id": "tujuh" },
        "eight": { "jp_character": "八", "romanji": ["hachi", "yattsu"], "sound": "はち", "meaning": "eight", "meaning_id": "delapan" },
        "nine": { "jp_character": "九", "romanji": ["kyuu", "ku"], "sound": "きゅう", "meaning": "nine", "meaning_id": "sembilan" },
        "ten": { "jp_character": "十", "romanji": ["juu", "too"], "sound": "じゅう", "meaning": "ten", "meaning_id": "sepuluh" },
        "hundred": { "jp_character": "百", "romanji": ["hyaku"], "sound": "ひゃく", "meaning": "hundred", "meaning_id": "seratus" },
        "thousand": { "jp_character": "千", "romanji": ["sen"], "sound": "せん", "meaning": "thousand", "meaning_id": "seribu" },
        "yen": { "jp_character": "円", "romanji": ["en"], "sound": "えん", "meaning": "yen / circle", "meaning_id": "yen / lingkaran" }
      }
    },
    "n5-time": {
      "title": "N5 Time",
      "tags": ["main_kana"],
      "characters": {
        "year": { "jp_character": "年", "romanji": ["nen", "toshi"], "sound": "ねん", "meaning": "year", "meaning_id": "tahun" },
        "hour": { "jp_character": "時", "romanji": ["ji", "toki"], "sound": "じ", "meaning": "time / hour", "meaning_id": "waktu / jam" },
        "minute": { "jp_character": "分", "romanji": ["fun", "pun", "bun"], "sound": "ふん", "meaning": "minute / part", "meaning_id": "menit / bagian" },
        "half": { "jp_character": "半", "romanji": ["han"], "sound": "はん", "meaning": "half", "meaning_id": "setengah" },
        "now": { "jp_character": "今", "romanji": ["ima", "kon"], "sound": "いま", "meaning": "now", "meaning_id": "sekarang" },
        "noon": { "jp_character": "午", "romanji": ["go"], "sound": "ご", "meaning": "noon", "meaning_id": "siang" },
        "before": { "jp_character": "前", "romanji": ["mae", "zen"], "sound": "まえ", "meaning": "before / front", "meaning_id": "sebelum / depan" },
        "after": { "jp_character": "後", "romanji": ["ato", "go", "kou"], "sound": "あと", "meaning": "after / behind", "meaning_id": "setelah / belakang" },
        "every": { "jp_character": "毎", "romanji": ["mai"], "sound": "まい", "meaning": "every", "meaning_id": "setiap" },
        "week": { "jp_character": "週", "romanji": ["shuu"], "sound": "しゅう", "meaning": "week", "meaning_id": "minggu" },
        "weekday": { "jp_character": "曜", "romanji": ["you"], "sound": "よう", "meaning": "weekday", "meaning_id": "hari dalam sepekan" }
      }
    },
    "n5-people": {
      "title": "N5 People",
      "tags": ["main_kana"],
      "characters": {
        "man": { "jp_character": "男", "romanji": ["otoko", "dan"], "sound": "おとこ", "meaning": "man", "meaning_id": "laki-laki" },
        "woman": { "jp_character": "女", "romanji": ["onna", "jo"], "sound": "おんな", "meaning": "woman", "meaning_id": "perempuan" },
        "child": { "jp_character": "子", "romanji": ["ko", "shi"], "sound": "こ", "meaning": "child", "meaning_id": "anak" },
        "father": { "jp_character": "父", "romanji": ["chichi", "fu"], "sound": "ちち", "meaning": "father", "meaning_id": "ayah" },
        "mother": { "jp_character": "母", "romanji": ["haha", "bo"], "sound": "はは", "meaning": "mother", "meaning_id": "ibu" },
        "name": { "jp_character": "名", "romanji": ["na", "mei"], "sound": "な", "meaning": "name", "meaning_id": "nama" }
      }
    },
    "n5-directions": {
      "title": "N5 Directions",
      "tags": ["main_kana"],
      "characters": {
        "up": { "jp_character": "上", "romanji": ["ue", "jou"], "sound": "うえ", "meaning": "up / above", "meaning_id": "atas" },
        "down": { "jp_character": "下", "romanji": ["shita", "ka", "ge"], "sound": "した", "meaning": "down / below", "meaning_id": "bawah" },
        "left": { "jp_character": "左", "romanji": ["hidari", "sa"], "sound": "ひだり", "meaning": "left", "meaning_id": "kiri" },
        "right": { "jp_character": "右", "romanji": ["migi", "u", "yuu"], "sound": "みぎ", "meaning": "right", "meaning_id": "kanan" },
        "east": { "jp_character": "東", "romanji": ["higashi", "tou"], "sound": "ひがし", "meaning": "east", "meaning_id": "timur" },
        "west": { "jp_character": "西", "romanji": ["nishi", "sai", "sei"], "sound": "にし", "meaning": "west", "meaning_id": "barat" },
        "south": { "jp_character": "南", "romanji": ["minami", "nan"], "sound": "みなみ", "meaning": "south", "meaning_id": "selatan" },
        "north": { "jp_character": "北", "romanji": ["kita", "hoku"], "sound": "きた", "meaning": "north", "meaning_id": "utara" },
        "outside": { "jp_character": "外", "romanji": ["soto", "gai"], "sound": "そと", "meaning": "outside", "meaning_id": "luar" }
      }
    },
    "n5-descriptions": {
      "title": "N5 Descriptions",
      "tags": ["main_kana"],
      "characters": {
        "high": { "jp_character": "高", "romanji": ["takai", "kou"], "sound": "たかい", "meaning": "high / expensive", "meaning_id": "tinggi / mahal" },
        "cheap": { "jp_character": "安", "romanji": ["yasui", "an"], "sound": "やすい", "meaning": "cheap / safe", "meaning_id": "murah / aman" },
        "new": { "jp_character": "新", "romanji": ["atarashii", "shin"], "sound": "あたらしい", "meaning": "new", "meaning_id": "baru" },
        "old": { "jp_character": "古", "romanji": ["furui", "ko"], "sound": "ふるい", "meaning": "old", "meaning_id": "lama" },
        "long": { "jp_character": "長", "romanji": ["nagai", "chou"], "sound": "ながい", "meaning": "long / leader", "meaning_id": "panjang / pemimpin" },
        "many": { "jp_character": "多", "romanji": ["ooi", "ta"], "sound": "おおい", "meaning": "many", "meaning_id": "banyak" },
        "few": { "jp_character": "少", "romanji": ["sukunai", "shou"], "sound": "すくない", "meaning": "few / little", "meaning_id": "sedikit" },
        "white": { "jp_character": "白", "romanji": ["shiroi", "haku"], "sound": "しろい", "meaning": "white", "meaning_id": "putih" },
        "black": { "jp_character": "黒", "romanji": ["kuroi", "koku"], "sound": "くろい", "meaning": "black", "meaning_id": "hitam" },
        "blue": { "jp_character": "青", "romanji": ["ao", "aoi", "sei"], "sound": "あお", "meaning": "blue", "meaning_id": "biru" }
      }
    },
    "n5-places": {
      "title": "N5 Places",
      "tags": ["main_kana"],
      "characters": {
        "heaven": { "jp_character": "天", "romanji": ["ten"], "sound": "てん", "meaning": "heaven / sky", "meaning_id": "langit" },
        "weather": { "jp_character": "気", "romanji": ["ki"], "sound": "き", "meaning": "spirit / mood", "meaning_id": "semangat / suasana hati" },
        "rain": { "jp_character": "雨", "romanji": ["ame", "u"], "sound": "あめ", "meaning": "rain", "meaning_id": "hujan" },
        "electricity": { "jp_character": "電", "romanji": ["den"], "sound": "でん", "meaning": "electricity", "meaning_id": "listrik" },
        "vehicle": { "jp_character": "車", "romanji": ["kuruma", "sha"], "sound": "くるま", "meaning": "car / vehicle", "meaning_id": "mobil / kendaraan" },
        "station": { "jp_character": "駅", "romanji": ["eki"], "sound": "えき", "meaning": "station", "meaning_id": "stasiun" },
        "country": { "jp_character": "国", "romanji": ["kuni", "koku"], "sound": "くに", "meaning": "country", "meaning_id": "negara" }
      }
    },
    "n5-study": {
      "title": "N5 Study",
      "tags": ["main_kana"],
      "characters": {
        "book": { "jp_character": "本", "romanji": ["hon", "moto"], "sound": "ほん", "meaning": "book / origin", "meaning_id": "buku / asal" },
        "writing": { "jp_character": "文", "romanji": ["bun", "mon"], "sound": "ぶん", "meaning": "sentence / writing", "meaning_id": "kalimat / tulisan" },
        "letter": { "jp_character": "字", "romanji": ["ji", "aza"], "sound": "じ", "meaning": "letter / character", "meaning_id": "huruf / karakter" },
        "language": { "jp_character": "語", "romanji": ["go", "kata"], "sound": "ご", "meaning": "language / word", "meaning_id": "bahasa / kata" },
        "speak": { "jp_character": "話", "romanji": ["hanashi", "hanasu", "wa"], "sound": "はなし", "meaning": "talk / speak", "meaning_id": "bicara" },
        "read": { "jp_character": "読", "romanji": ["yomu", "doku"], "sound": "よむ", "meaning": "read", "meaning_id": "membaca" },
        "write": { "jp_character": "書", "romanji": ["kaku", "sho"], "sound": "かく", "meaning": "write", "meaning_id": "menulis" },
        "listen": { "jp_character": "聞", "romanji": ["kiku", "bun"], "sound": "きく", "meaning": "hear / listen", "meaning_id": "mendengar" },
        "say": { "jp_character": "言", "romanji": ["iu", "gen", "gon"], "sound": "いう", "meaning": "say", "meaning_id": "berkata" }
      }
    },
    "n5-actions-more": {
      "title": "N5 More Actions",
      "tags": ["main_kana"],
      "characters": {
        "buy": { "jp_character": "買", "romanji": ["kau", "bai"], "sound": "かう", "meaning": "buy", "meaning_id": "membeli" },
        "come": { "jp_character": "来", "romanji": ["kuru", "rai"], "sound": "くる", "meaning": "come", "meaning_id": "datang" },
        "return": { "jp_character": "帰", "romanji": ["kaeru", "ki"], "sound": "かえる", "meaning": "return home", "meaning_id": "pulang" },
        "enter": { "jp_character": "入", "romanji": ["hairu", "nyuu"], "sound": "はいる", "meaning": "enter", "meaning_id": "masuk" },
        "exit": { "jp_character": "出", "romanji": ["deru", "shutsu"], "sound": "でる", "meaning": "exit / go out", "meaning_id": "keluar" },
        "meet": { "jp_character": "会", "romanji": ["au", "kai"], "sound": "あう", "meaning": "meet", "meaning_id": "bertemu" }
      }
    }
  }
};

const n5KanjiCategoryDefinitions = [
  {
    key: 'n5-numbers',
    title: 'N5 Numbers',
    title_id: 'Angka & Jumlah',
    characters: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '円', '多', '少'],
  },
  {
    key: 'n5-time',
    title: 'N5 Time & Days',
    title_id: 'Waktu & Hari',
    characters: ['日', '月', '年', '時', '分', '半', '今', '午', '前', '後', '毎', '週', '曜'],
  },
  {
    key: 'n5-directions',
    title: 'N5 Directions & Position',
    title_id: 'Arah & Posisi',
    characters: ['上', '下', '左', '右', '東', '西', '南', '北', '外', '中', '先', '大', '小', '高', '安', '新', '古', '長'],
  },
  {
    key: 'n5-nature',
    title: 'N5 Nature & Environment',
    title_id: 'Alam & Lingkungan',
    characters: ['山', '川', '水', '木', '火', '土', '田', '天', '気', '雨', '電', '白', '黒', '青'],
  },
  {
    key: 'n5-people',
    title: 'N5 People & Relationships',
    title_id: 'Orang & Hubungan',
    characters: ['人', '友', '男', '女', '子', '父', '母', '名', '目', '耳', '手', '足', '口'],
  },
  {
    key: 'n5-activities',
    title: 'N5 Activities & Basic Verbs',
    title_id: 'Aktivitas & Kata Kerja Dasar',
    characters: ['学', '生', '校', '店', '休', '食', '飲', '見', '行', '本', '文', '字', '語', '話', '読', '書', '聞', '言', '買', '来', '帰', '入', '出', '会', '車', '駅', '国'],
  },
];

const n4KanjiCategoryDefinitions = [
  {
    key: 'n4-daily-verbs',
    title: 'N4 Daily Verbs',
    title_id: 'Kata Kerja Harian',
    entries: [
      ['thing', '事', ['koto', 'ji'], 'こと', 'thing / matter', 'hal / urusan'],
      ['use', '使', ['tsukau', 'shi'], 'つかう', 'use', 'menggunakan'],
      ['wait', '待', ['matsu', 'tai'], 'まつ', 'wait', 'menunggu'],
      ['hold', '持', ['motsu', 'ji'], 'もつ', 'hold / carry', 'memegang / membawa'],
      ['begin', '始', ['hajimeru', 'shi'], 'はじめる', 'begin', 'memulai'],
      ['end', '終', ['owaru', 'shuu'], 'おわる', 'end / finish', 'selesai'],
      ['open', '開', ['hiraku', 'kai'], 'ひらく', 'open', 'membuka'],
      ['close', '閉', ['shimeru', 'hei'], 'しめる', 'close', 'menutup'],
      ['move', '動', ['ugoku', 'dou'], 'うごく', 'move', 'bergerak'],
      ['work', '働', ['hataraku', 'dou'], 'はたらく', 'work', 'bekerja'],
      ['teach', '教', ['oshieru', 'kyou'], 'おしえる', 'teach', 'mengajar'],
      ['learn', '習', ['narau', 'shuu'], 'ならう', 'learn / practice', 'belajar / berlatih'],
      ['think', '考', ['kangaeru', 'kou'], 'かんがえる', 'think', 'berpikir'],
      ['know', '知', ['shiru', 'chi'], 'しる', 'know', 'mengetahui'],
      ['feel', '思', ['omou', 'shi'], 'おもう', 'think / feel', 'berpikir / merasa'],
      ['forget', '忘', ['wasureru', 'bou'], 'わすれる', 'forget', 'lupa'],
      ['remember', '覚', ['oboeru', 'kaku'], 'おぼえる', 'remember / learn', 'mengingat / menghafal'],
      ['answer', '答', ['kotaeru', 'tou'], 'こたえる', 'answer', 'menjawab'],
      ['ask', '問', ['tou', 'mon'], 'とう', 'ask / question', 'bertanya / pertanyaan'],
      ['study', '勉', ['ben'], 'べん', 'diligence / study', 'ketekunan / belajar'],
      ['make', '作', ['tsukuru', 'saku'], 'つくる', 'make / create', 'membuat'],
      ['send', '送', ['okuru', 'sou'], 'おくる', 'send', 'mengirim'],
      ['return', '返', ['kaesu', 'hen'], 'かえす', 'return / give back', 'mengembalikan'],
      ['borrow', '借', ['kariru', 'shaku'], 'かりる', 'borrow', 'meminjam'],
      ['lend', '貸', ['kasu', 'tai'], 'かす', 'lend', 'meminjamkan'],
      ['pay', '払', ['harau', 'futsu'], 'はらう', 'pay', 'membayar'],
      ['choose', '選', ['erabu', 'sen'], 'えらぶ', 'choose', 'memilih'],
      ['wake', '起', ['okiru', 'ki'], 'おきる', 'get up / wake', 'bangun'],
      ['sleep', '寝', ['neru', 'shin'], 'ねる', 'sleep / go to bed', 'tidur'],
      ['swim', '泳', ['oyogu', 'ei'], 'およぐ', 'swim', 'berenang'],
      ['run', '走', ['hashiru', 'sou'], 'はしる', 'run', 'berlari'],
      ['walk', '歩', ['aruku', 'ho'], 'あるく', 'walk', 'berjalan'],
      ['cross', '渡', ['wataru', 'to'], 'わたる', 'cross / hand over', 'menyeberang / menyerahkan'],
      ['ride', '乗', ['noru', 'jou'], 'のる', 'ride / get on', 'naik / menumpang'],
      ['getOff', '降', ['oriru', 'kou'], 'おりる', 'get off / descend', 'turun'],
      ['stop', '止', ['tomaru', 'shi'], 'とまる', 'stop', 'berhenti'],
      ['pass', '通', ['tooru', 'tsuu'], 'とおる', 'pass / go through', 'melewati'],
      ['advance', '進', ['susumu', 'shin'], 'すすむ', 'advance / proceed', 'maju / melanjutkan'],
      ['take', '取', ['toru', 'shu'], 'とる', 'take / obtain', 'mengambil'],
      ['fix', '直', ['naosu', 'choku'], 'なおす', 'fix / repair', 'memperbaiki'],
    ],
  },
  {
    key: 'n4-qualities',
    title: 'N4 Qualities & Conditions',
    title_id: 'Sifat & Kondisi',
    entries: [
      ['bright', '明', ['akarui', 'mei'], 'あかるい', 'bright / clear', 'terang / jelas'],
      ['dark', '暗', ['kurai', 'an'], 'くらい', 'dark', 'gelap'],
      ['strong', '強', ['tsuyoi', 'kyou'], 'つよい', 'strong', 'kuat'],
      ['weak', '弱', ['yowai', 'jaku'], 'よわい', 'weak', 'lemah'],
      ['early', '早', ['hayai', 'sou'], 'はやい', 'early / fast', 'awal / cepat'],
      ['late', '遅', ['osoi', 'chi'], 'おそい', 'late / slow', 'terlambat / lambat'],
      ['heavy', '重', ['omoi', 'juu'], 'おもい', 'heavy / important', 'berat / penting'],
      ['light', '軽', ['karui', 'kei'], 'かるい', 'light (weight)', 'ringan'],
      ['wide', '広', ['hiroi', 'kou'], 'ひろい', 'wide / spacious', 'luas'],
      ['low', '低', ['hikui', 'tei'], 'ひくい', 'low', 'rendah'],
      ['good', '良', ['yoi', 'ryou'], 'よい', 'good', 'baik'],
      ['bad', '悪', ['warui', 'aku'], 'わるい', 'bad / evil', 'buruk / jahat'],
      ['pleasant', '楽', ['tanoshii', 'raku'], 'たのしい', 'pleasant / fun', 'menyenangkan'],
      ['correct', '正', ['tadashii', 'sei'], 'ただしい', 'correct / proper', 'benar / tepat'],
      ['warm', '暖', ['atatakai', 'dan'], 'あたたかい', 'warm', 'hangat'],
      ['cold', '寒', ['samui', 'kan'], 'さむい', 'cold (weather)', 'dingin'],
      ['hot', '暑', ['atsui', 'sho'], 'あつい', 'hot (weather)', 'panas'],
      ['cool', '涼', ['suzushii', 'ryou'], 'すずしい', 'cool / refreshing', 'sejuk'],
      ['thick', '太', ['futoi', 'tai'], 'ふとい', 'thick / fat', 'tebal / gemuk'],
      ['thin', '細', ['hosoi', 'sai'], 'ほそい', 'thin / narrow', 'tipis / sempit'],
      ['round', '丸', ['marui', 'gan'], 'まるい', 'round', 'bulat'],
      ['beautiful', '美', ['utsukushii', 'bi'], 'うつくしい', 'beautiful', 'indah / cantik'],
      ['young', '若', ['wakai', 'jaku'], 'わかい', 'young', 'muda'],
      ['busy', '忙', ['isogashii', 'bou'], 'いそがしい', 'busy', 'sibuk'],
      ['quiet', '静', ['shizuka', 'sei'], 'しずか', 'quiet / calm', 'tenang'],
      ['energy', '元', ['gen'], 'げん', 'origin / energy', 'asal / energi'],
      ['true', '真', ['makoto', 'shin'], 'まこと', 'true / real', 'benar / nyata'],
      ['same', '同', ['onaji', 'dou'], 'おなじ', 'same', 'sama'],
      ['different', '別', ['betsu'], 'べつ', 'different / separate', 'berbeda / terpisah'],
      ['special', '特', ['toku'], 'とく', 'special', 'khusus'],
      ['necessary', '必', ['hitsu'], 'ひつ', 'necessary / certain', 'perlu / pasti'],
      ['strange', '変', ['hen', 'kawaru'], 'へん', 'strange / change', 'aneh / berubah'],
      ['troubled', '困', ['komaru', 'kon'], 'こまる', 'be troubled', 'kesulitan'],
      ['tired', '疲', ['tsukareru', 'hi'], 'つかれる', 'tired', 'lelah'],
      ['painful', '痛', ['itai', 'tsuu'], 'いたい', 'painful', 'sakit'],
      ['happy', '幸', ['shiawase', 'kou'], 'しあわせ', 'happiness / fortunate', 'bahagia / beruntung'],
      ['sad', '悲', ['kanashii', 'hi'], 'かなしい', 'sad', 'sedih'],
      ['scary', '怖', ['kowai', 'fu'], 'こわい', 'scary / frightening', 'menakutkan'],
      ['deep', '深', ['fukai', 'shin'], 'ふかい', 'deep', 'dalam'],
      ['shallow', '浅', ['asai', 'sen'], 'あさい', 'shallow', 'dangkal'],
    ],
  },
  {
    key: 'n4-buildings-places',
    title: 'N4 Buildings & Places',
    title_id: 'Bangunan & Tempat',
    entries: [
      ['travel', '旅', ['tabi', 'ryo'], 'たび', 'travel / trip', 'perjalanan'],
      ['building', '館', ['kan'], 'かん', 'large building / hall', 'gedung / aula'],
      ['road', '道', ['michi', 'dou'], 'みち', 'road / way', 'jalan'],
      ['near', '近', ['chikai', 'kin'], 'ちかい', 'near', 'dekat'],
      ['far', '遠', ['tooi', 'en'], 'とおい', 'far', 'jauh'],
      ['town', '町', ['machi', 'chou'], 'まち', 'town', 'kota kecil'],
      ['city', '市', ['shi', 'ichi'], 'し', 'city / market', 'kota / pasar'],
      ['place', '場', ['ba', 'jou'], 'ば', 'place / location', 'tempat'],
      ['location', '所', ['tokoro', 'sho'], 'ところ', 'place', 'tempat'],
      ['build', '建', ['tateru', 'ken'], 'たてる', 'build', 'membangun'],
      ['illness', '病', ['byou', 'yamai'], 'びょう', 'illness', 'penyakit'],
      ['institution', '院', ['in'], 'いん', 'institution / hospital', 'lembaga / rumah sakit'],
      ['ward', '区', ['ku'], 'く', 'ward / district', 'kecamatan / distrik'],
      ['capital', '都', ['miyako', 'to'], 'みやこ', 'capital / metropolis', 'ibu kota / metropolis'],
      ['prefecture', '県', ['ken'], 'けん', 'prefecture', 'prefektur'],
      ['village', '村', ['mura', 'son'], 'むら', 'village', 'desa'],
      ['island', '島', ['shima', 'tou'], 'しま', 'island', 'pulau'],
      ['bridge', '橋', ['hashi', 'kyou'], 'はし', 'bridge', 'jembatan'],
      ['pond', '池', ['ike', 'chi'], 'いけ', 'pond', 'kolam'],
      ['temple', '寺', ['tera', 'ji'], 'てら', 'temple', 'kuil'],
      ['shrine', '神', ['kami', 'shin'], 'かみ', 'god / deity', 'dewa'],
      ['gate', '門', ['mon'], 'もん', 'gate', 'gerbang'],
      ['floor', '階', ['kai'], 'かい', 'floor / story of a building', 'lantai / tingkat gedung'],
      ['room', '室', ['shitsu', 'muro'], 'しつ', 'room', 'ruangan'],
      ['shop', '屋', ['ya', 'oku'], 'や', 'shop / roof', 'toko / atap'],
      ['hall', '堂', ['dou'], 'どう', 'hall', 'aula'],
      ['port', '港', ['minato', 'kou'], 'みなと', 'port / harbor', 'pelabuhan'],
      ['boat', '船', ['fune', 'sen'], 'ふね', 'boat / ship', 'perahu / kapal'],
      ['department', '部', ['bu'], 'ぶ', 'department / section', 'bagian / departemen'],
      ['craft', '工', ['kou', 'ku'], 'こう', 'craft / construction', 'kerajinan / konstruksi'],
      ['garden', '庭', ['niwa', 'tei'], 'にわ', 'garden', 'taman'],
      ['corner', '角', ['kado', 'kaku'], 'かど', 'corner / angle', 'sudut'],
      ['ground', '地', ['chi', 'ji'], 'ち', 'ground / land', 'tanah / daratan'],
      ['map', '図', ['zu', 'to'], 'ず', 'diagram / map', 'diagram / peta'],
      ['slope', '坂', ['saka', 'han'], 'さか', 'slope / hill', 'lereng / tanjakan'],
      ['shore', '岸', ['kishi', 'gan'], 'きし', 'shore / bank', 'tepi / pantai'],
      ['lake', '湖', ['mizuumi', 'ko'], 'みずうみ', 'lake', 'danau'],
      ['forest', '森', ['mori', 'shin'], 'もり', 'forest', 'hutan'],
      ['plain', '原', ['hara', 'gen'], 'はら', 'plain / field', 'dataran / padang'],
      ['rock', '岩', ['iwa', 'gan'], 'いわ', 'rock / boulder', 'batu besar'],
    ],
  },
  {
    key: 'n4-relations-society',
    title: 'N4 Relationships & Society',
    title_id: 'Hubungan & Masyarakat',
    entries: [
      ['house', '家', ['ie', 'ka'], 'いえ', 'house / home', 'rumah'],
      ['family', '族', ['zoku'], 'ぞく', 'family / tribe', 'keluarga'],
      ['parent', '親', ['oya', 'shin'], 'おや', 'parent', 'orang tua'],
      ['elderBrother', '兄', ['ani', 'kyou'], 'あに', 'older brother', 'kakak laki-laki'],
      ['elderSister', '姉', ['ane', 'shi'], 'あね', 'older sister', 'kakak perempuan'],
      ['youngerBrother', '弟', ['otouto', 'tei'], 'おとうと', 'younger brother', 'adik laki-laki'],
      ['youngerSister', '妹', ['imouto', 'mai'], 'いもうと', 'younger sister', 'adik perempuan'],
      ['husband', '夫', ['otto', 'fu'], 'おっと', 'husband', 'suami'],
      ['wife', '妻', ['tsuma', 'sai'], 'つま', 'wife', 'istri'],
      ['he', '彼', ['kare', 'hi'], 'かれ', 'he / boyfriend', 'dia / pacar laki-laki'],
      ['member', '員', ['in'], 'いん', 'member / staff', 'anggota / staf'],
      ['company', '社', ['sha', 'yashiro'], 'しゃ', 'company / shrine', 'perusahaan / kuil'],
      ['person', '者', ['mono', 'sha'], 'もの', 'person', 'orang'],
      ['everyone', '皆', ['mina', 'kai'], 'みな', 'everyone', 'semua orang'],
      ['who', '誰', ['dare'], 'だれ', 'who', 'siapa'],
      ['you', '君', ['kimi', 'kun'], 'きみ', 'you / lord', 'kamu / tuan'],
      ['generation', '代', ['dai', 'yo'], 'だい', 'generation / era', 'generasi / zaman'],
      ['world', '世', ['yo', 'sei'], 'よ', 'world / generation', 'dunia / generasi'],
      ['society', '界', ['kai'], 'かい', 'world / society', 'dunia / masyarakat'],
      ['main', '主', ['nushi', 'shu'], 'ぬし', 'main / master', 'utama / tuan'],
      ['other', '他', ['hoka', 'ta'], 'ほか', 'other', 'lain'],
      ['guest', '客', ['kyaku'], 'きゃく', 'guest / customer', 'tamu / pelanggan'],
      ['people', '民', ['tami', 'min'], 'たみ', 'people / citizens', 'rakyat / warga'],
      ['government', '政', ['sei'], 'せい', 'government / politics', 'pemerintahan / politik'],
      ['role', '役', ['yaku'], 'やく', 'role / duty', 'peran / tugas'],
      ['serve', '仕', ['tsukaeru', 'shi'], 'つかえる', 'serve / work for', 'melayani / bekerja untuk'],
      ['produce', '産', ['umu', 'san'], 'うむ', 'produce / give birth', 'menghasilkan / melahirkan'],
      ['image', '像', ['zou'], 'ぞう', 'image / statue', 'gambar / patung'],
      ['body', '身', ['mi', 'shin'], 'み', 'body / oneself', 'tubuh / diri sendiri'],
      ['heart', '心', ['kokoro', 'shin'], 'こころ', 'heart / mind', 'hati / pikiran'],
      ['power', '力', ['chikara', 'ryoku'], 'ちから', 'power / strength', 'tenaga / kekuatan'],
      ['voice', '声', ['koe', 'sei'], 'こえ', 'voice', 'suara'],
      ['ceremony', '式', ['shiki'], 'しき', 'ceremony / style', 'upacara / gaya'],
      ['tie', '結', ['musubu', 'ketsu'], 'むすぶ', 'tie / connect', 'mengikat / menghubungkan'],
      ['marriage', '婚', ['kon'], 'こん', 'marriage', 'pernikahan'],
      ['stay', '留', ['tomaru', 'ryuu'], 'とまる', 'stay / detain', 'tinggal / menahan'],
      ['visit', '訪', ['otozureru', 'hou'], 'おとずれる', 'visit', 'mengunjungi'],
      ['trust', '信', ['shin'], 'しん', 'trust / believe', 'percaya'],
      ['promise', '約', ['yaku'], 'やく', 'promise / approximately', 'janji / kira-kira'],
      ['interaction', '交', ['majiwaru', 'kou'], 'まじわる', 'interact / exchange', 'berinteraksi / bertukar'],
    ],
  },
  {
    key: 'n4-weather-time-nature',
    title: 'N4 Weather, Time & Nature',
    title_id: 'Cuaca, Waktu & Alam',
    entries: [
      ['medicine', '薬', ['kusuri', 'yaku'], 'くすり', 'medicine', 'obat'],
      ['bird', '鳥', ['tori', 'chou'], 'とり', 'bird', 'burung'],
      ['fish', '魚', ['sakana', 'gyo'], 'さかな', 'fish', 'ikan'],
      ['meat', '肉', ['niku'], 'にく', 'meat', 'daging'],
      ['field', '野', ['no', 'ya'], 'の', 'field / plain', 'padang / dataran'],
      ['vegetable', '菜', ['sai', 'na'], 'さい', 'vegetable', 'sayuran'],
      ['tea', '茶', ['cha', 'sa'], 'ちゃ', 'tea', 'teh'],
      ['rice', '米', ['kome', 'bei'], 'こめ', 'rice', 'beras'],
      ['spring', '春', ['haru', 'shun'], 'はる', 'spring', 'musim semi'],
      ['summer', '夏', ['natsu', 'ka'], 'なつ', 'summer', 'musim panas'],
      ['autumn', '秋', ['aki', 'shuu'], 'あき', 'autumn', 'musim gugur'],
      ['winter', '冬', ['fuyu', 'tou'], 'ふゆ', 'winter', 'musim dingin'],
      ['morning', '朝', ['asa', 'chou'], 'あさ', 'morning', 'pagi'],
      ['noon', '昼', ['hiru', 'chuu'], 'ひる', 'noon / daytime', 'siang'],
      ['night', '夜', ['yoru', 'ya'], 'よる', 'night / evening', 'malam'],
      ['evening', '夕', ['yuu'], 'ゆう', 'evening', 'sore'],
      ['clearWeather', '晴', ['hareru', 'sei'], 'はれる', 'clear / sunny', 'cerah'],
      ['cloudy', '曇', ['kumoru', 'don'], 'くもる', 'cloudy', 'berawan'],
      ['snow', '雪', ['yuki', 'setsu'], 'ゆき', 'snow', 'salju'],
      ['wind', '風', ['kaze', 'fuu'], 'かぜ', 'wind', 'angin'],
      ['cloud', '雲', ['kumo', 'un'], 'くも', 'cloud', 'awan'],
      ['fog', '霧', ['kiri', 'mu'], 'きり', 'fog', 'kabut'],
      ['thunder', '雷', ['kaminari', 'rai'], 'かみなり', 'thunder', 'guntur'],
      ['ice', '氷', ['koori', 'hyou'], 'こおり', 'ice', 'es'],
      ['wave', '波', ['nami', 'ha'], 'なみ', 'wave', 'ombak'],
      ['grass', '草', ['kusa', 'sou'], 'くさ', 'grass', 'rumput'],
      ['flower', '花', ['hana', 'ka'], 'はな', 'flower', 'bunga'],
      ['insect', '虫', ['mushi', 'chuu'], 'むし', 'insect', 'serangga'],
      ['star', '星', ['hoshi', 'sei'], 'ほし', 'star', 'bintang'],
      ['light', '光', ['hikari', 'kou'], 'ひかり', 'light', 'cahaya'],
      ['valley', '谷', ['tani', 'koku'], 'たに', 'valley', 'lembah'],
      ['degree', '度', ['do', 'tabi'], 'ど', 'degree / time', 'derajat / kali'],
      ['end', '末', ['sue', 'matsu'], 'すえ', 'end / tip', 'akhir / ujung'],
      ['beginning', '初', ['hatsu', 'hajime'], 'はつ', 'first / beginning', 'pertama / awal'],
      ['longAgo', '昔', ['mukashi', 'seki'], 'むかし', 'long ago / old times', 'dahulu / zaman dulu'],
      ['lateEvening', '晩', ['ban'], 'ばん', 'evening / night', 'petang / malam'],
      ['leaf', '葉', ['ha', 'you'], 'は', 'leaf', 'daun'],
      ['branch', '枝', ['eda', 'shi'], 'えだ', 'branch', 'ranting'],
      ['root', '根', ['ne', 'kon'], 'ね', 'root', 'akar'],
      ['fruit', '実', ['mi', 'jitsu'], 'み', 'fruit / truth', 'buah / kenyataan'],
    ],
  },
];

function splitKanjiCategory(category, entries) {
  const groupCount = Math.ceil(entries.length / 10);
  return Array.from({ length: groupCount }, (_, index) => {
    const groupNumber = index + 1;
    return {
      ...category,
      key: `${category.key}-${groupNumber}`,
      title: `${category.title} - ${groupNumber}`,
      title_id: `Kelompok ${groupNumber}`,
      themeTitle: category.title,
      themeTitle_id: category.title_id,
      groupNumber,
      entries: entries.slice(index * 10, groupNumber * 10),
    };
  });
}

function addKanjiUsage(entry) {
  const usage = kanjiUsage[entry.jp_character];
  const meanings = kanjiUsageMeanings[entry.jp_character];
  const readings = kanjiReadings[entry.jp_character];
  if (!usage || !meanings || !readings) {
    throw new Error(`Kanji usage, contextual meaning, or readings are missing: ${entry.jp_character}`);
  }
  return {
    ...entry,
    usage: {
      word: usage[0],
      romanji: usage[1],
      meaning: meanings[0],
      meaning_id: meanings[1],
    },
    readings,
  };
}

const n5KanjiGroups = n5KanjiCategoryDefinitions.flatMap(category =>
  splitKanjiCategory(category, category.characters)
);
const n4KanjiGroups = n4KanjiCategoryDefinitions.flatMap(category =>
  splitKanjiCategory(category, category.entries)
);
const kanjiCategoryDefinitions = [
  ...n5KanjiGroups.map(category => ({ ...category, level: 'N5' })),
  ...n4KanjiGroups.map(category => ({ ...category, level: 'N4' })),
];
const existingKanjiEntries = Object.values(kanaCharacters.kanjiSource)
  .flatMap(group => Object.values(group.characters));
const kanjiByCharacter = new Map(existingKanjiEntries.map(character => [character.jp_character, character]));
const assignedKanji = new Set();

kanaCharacters.kanji = Object.fromEntries(kanjiCategoryDefinitions.map(category => {
  const characters = category.level === 'N5'
    ? Object.fromEntries(category.entries.map(character => {
        const entry = kanjiByCharacter.get(character);
        if (!entry || assignedKanji.has(character)) {
          throw new Error(`Kanji N5 category assignment is missing or duplicated: ${character}`);
        }
        assignedKanji.add(character);
        return [character, addKanjiUsage(entry)];
      }))
    : Object.fromEntries(category.entries.map(([key, jp_character, romanji, sound, meaning, meaning_id]) => {
        const entry = addKanjiUsage({ jp_character, romanji, sound, meaning, meaning_id });
        if (kanjiByCharacter.has(entry.jp_character) || assignedKanji.has(entry.jp_character)) {
          throw new Error(`Kanji N4 category duplicates an existing character: ${entry.jp_character}`);
        }
        assignedKanji.add(entry.jp_character);
        return [key, entry];
      }));

  return [category.key, {
    title: category.title,
    title_id: category.title_id,
    level: category.level,
    themeTitle: category.themeTitle,
    themeTitle_id: category.themeTitle_id,
    groupNumber: category.groupNumber,
    tags: ['main_kana'],
    characters,
  }];
}));
delete kanaCharacters.kanjiSource;

validateKanjiReadings(Object.values(kanaCharacters.kanji).flatMap(group => Object.values(group.characters)));
const kanjiCharacters = Object.values(kanaCharacters.kanji).flatMap(group => Object.values(group.characters));
const kanjiCharactersById = new Set(kanjiCharacters.map(character => character.jp_character));
if (
  kanjiCharactersById.size !== Object.keys(kanjiUsageMeanings).length ||
  Object.keys(kanjiUsageMeanings).some(character => !kanjiCharactersById.has(character))
) {
  throw new Error('Kanji contextual meaning coverage mismatch: keys must match kanaCharacters.kanji exactly.');
}

const n4KanjiCount = n4KanjiCategoryDefinitions.reduce((count, category) => count + category.entries.length, 0);
if (n4KanjiCategoryDefinitions.length !== 5 || n4KanjiCategoryDefinitions.some(category => category.entries.length !== 40) || n4KanjiCount !== 200 || n4KanjiGroups.length !== 20 || n4KanjiGroups.some(category => category.entries.length !== 10)) {
  throw new Error(`Kanji N4 should have five themes of 40 characters, split into 20 groups of 10; found ${n4KanjiCount} characters.`);
}
if (n5KanjiGroups.some(category => category.entries.length > 10)) {
  throw new Error('Kanji N5 groups must not contain more than 10 characters.');
}
if (assignedKanji.size !== existingKanjiEntries.length + n4KanjiCount) {
  const unassignedKanji = existingKanjiEntries.map(character => character.jp_character);
  throw new Error(`Kanji N5 characters have no category: ${unassignedKanji.join(', ')}`);
}