import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  Pause,
  Play,
  TrendingUp,
  TrendingDown,
  Flame,
  Gem,
  AlertTriangle,
  ArrowUpDown,
  Target,
  Clock,
  Sparkles,
  BarChart3,
  ShieldAlert,
  Calculator,
  CheckCircle2,
  X,
  Layers
} from 'lucide-react';

// 2026最新台股個股與熱門 ETF 觀測資料庫
const INITIAL_STOCKS = [
  // 一、年化殖利率 >= 20% 超高息標的
  {
    id: '00892',
    name: '富邦台灣半導體',
    assetType: 'ETF',
    category: '半導體ETF',
    price: 18.20,
    prevClose: 17.95,
    dividend: 4.15, // 18.20 * 22.8% ≈ 4.15
    isAnnualized: true,
    predictedChangePct: 9.8,
    entryRange: [17.50, 18.30],
    exitRange: [19.80, 20.60],
    signalType: 'STRONG_BUY',
    signalLabel: '強力進場',
    entryReasons: [
      '年化殖利率高達 22.8%，近期配息表現極為亮眼，除息前夕吸引高息資金卡位',
      '日線 KD 指標於 25 附近形成低檔黃金交叉，回測月線支撐有守',
      '半導體成分股受惠 AI 晶片需求暢旺，具備填息高動能'
    ],
    exitReasons: [
      '當股價漲至 20.0 元以上，年化殖利率將收斂至 20% 以下可分批停利',
      'RSI 指標超過 78 進入短線超買過熱區，或折溢價幅度超過 +1.5%',
      '完成填息目標後可將資金輪動至下一波除息高息 ETF'
    ],
    historyOffsets: [-0.55, -0.45, -0.60, -0.35, -0.25, -0.30, -0.20, -0.10, 0.0, 0.25]
  },
  {
    id: '00943',
    name: '兆豐電子高息等權',
    assetType: 'ETF',
    category: '高股息ETF',
    price: 15.60,
    prevClose: 15.45,
    dividend: 3.51, // 15.60 * 22.5% = 3.51
    isAnnualized: true,
    predictedChangePct: 11.4,
    entryRange: [15.00, 15.70],
    exitRange: [17.20, 17.90],
    signalType: 'STRONG_BUY',
    signalLabel: '強力進場',
    entryReasons: [
      '年化殖利率約 22.5%，等權重配置兼具低基期補漲與高配息雙優勢',
      '股價僅 15 元出頭，銅板價位極具親和力，貼近布林通道下軌支撐',
      '外資與自營商連續買超，成交量溫和放大'
    ],
    exitReasons: [
      '股價觸及前波套牢壓力區 17.4 元附近建議先調節一半',
      '正乖離率過大（> 8%）時避免追高並分批獲利了結',
      '成分股定審換股前夕波動加劇可先鎖定波段價差'
    ],
    historyOffsets: [-0.40, -0.45, -0.35, -0.25, -0.20, -0.15, -0.10, -0.05, 0.0, 0.15]
  },
  {
    id: '00934',
    name: '中信成長高股息',
    assetType: 'ETF',
    category: '高股息ETF',
    price: 19.80,
    prevClose: 19.90,
    dividend: 4.38, // 19.80 * 22.1% ≈ 4.38
    isAnnualized: true,
    predictedChangePct: 8.5,
    entryRange: [19.20, 19.90],
    exitRange: [21.30, 22.00],
    signalType: 'STRONG_BUY',
    signalLabel: '強力進場',
    entryReasons: [
      '年化殖利率高達 22.1%，兼具成長動能與超高股息雙重題材',
      '今日小幅拉回測 10 日均線支撐，提供逢低分批進場良機',
      '投信買盤持續進駐，籌碼安定度高'
    ],
    exitReasons: [
      '股價突破 21.5 元後短線漲幅已提前反映配息利多',
      'MACD 紅柱開始縮短且出現高檔背離訊號',
      '除息後若快速填息達 80% 以上可先獲利了結'
    ],
    historyOffsets: [0.10, 0.25, 0.30, 0.15, 0.20, 0.12, 0.05, 0.08, 0.0, -0.10]
  },
  {
    id: '2442',
    name: '新美齊',
    assetType: '個股',
    category: '建材營造',
    price: 26.80,
    prevClose: 26.20,
    dividend: 5.47, // 26.80 * 20.4% ≈ 5.47
    isAnnualized: false,
    predictedChangePct: 14.2,
    entryRange: [25.60, 27.00],
    exitRange: [30.40, 31.80],
    signalType: 'STRONG_BUY',
    signalLabel: '強力進場',
    entryReasons: [
      '新建案交屋入帳高峰，高配息題材參考殖利率高達 20.4% 且股價僅 26 元附近',
      '帶量突破近三個月整理平台頸線，日週線同步多頭排列',
      '低價高息雙重題材，吸引存股族與波段主力同步加碼'
    ],
    exitReasons: [
      '股價來到 31 元整數關卡時，殖利率收斂至 17.5% 左右可分批停利',
      '營建族群出現爆量長上影線時宜先落袋為安',
      '除息前一日若已大漲超過 15% 建議先賺波段價差'
    ],
    historyOffsets: [-1.10, -0.95, -0.85, -0.75, -0.55, -0.40, -0.25, -0.15, 0.0, 0.60]
  },

  // 二、一股價格低又股息好（銅板低價高息：股價 < 40元 且 殖利率 > 8%）
  {
    id: '00923',
    name: '群益台ESG低碳50',
    assetType: 'ETF',
    category: '市值ESG ETF',
    price: 22.60,
    prevClose: 22.40,
    dividend: 3.23, // 22.60 * 14.3% ≈ 3.23
    isAnnualized: true,
    predictedChangePct: 9.6,
    entryRange: [21.90, 22.70],
    exitRange: [24.60, 25.40],
    signalType: 'STRONG_BUY',
    signalLabel: '強力進場',
    entryReasons: [
      '股價約 22.6 元，累計配息率高達 14.3%，兼顧市值成長與高息回報',
      '受惠碳費制度與大型權值電子股獲利創高，填息速度極快',
      '均線呈多頭發散，沿 5 日線穩步墊高'
    ],
    exitReasons: [
      '股價觸及 25 元整數心理關卡且 RSI 超過 80 時分批調節',
      '市價相對淨值溢價超過 1.2% 時不宜追買并可先減碼',
      '達到波段 10% 價差目標後可保留核心領息部位'
    ],
    historyOffsets: [-0.50, -0.45, -0.35, -0.30, -0.25, -0.15, -0.10, -0.05, 0.0, 0.20]
  },
  {
    id: '2528',
    name: '皇普',
    assetType: '個股',
    category: '建材營造',
    price: 34.50,
    prevClose: 34.10,
    dividend: 4.62, // 34.50 * 13.4% ≈ 4.62
    isAnnualized: false,
    predictedChangePct: 12.5,
    entryRange: [33.20, 34.70],
    exitRange: [38.50, 39.80],
    signalType: 'STRONG_BUY',
    signalLabel: '強力進場',
    entryReasons: [
      '股價僅 34.5 元且殖利率高達 13.4%，具備極佳安全邊際',
      '多筆百億級建案陸續完工認列，未來兩年配息能見度高',
      '週線 MACD 剛翻紅，中期波段起漲訊號明確'
    ],
    exitReasons: [
      '股價接近 39 元時殖利率降至 11.8% 以下，獲利空間收斂',
      '技術指標出現高檔背離或跌破 10 日均線時停利',
      '達到預設 12% 波段停利點可分批落袋'
    ],
    historyOffsets: [-1.05, -0.90, -0.75, -0.65, -0.45, -0.35, -0.20, -0.10, 0.0, 0.40]
  },
  {
    id: '00919',
    name: '群益台灣精選高息',
    assetType: 'ETF',
    category: '高股息ETF',
    price: 24.50,
    prevClose: 24.35,
    dividend: 3.01, // 24.50 * 12.3% ≈ 3.01
    isAnnualized: true,
    predictedChangePct: 8.4,
    entryRange: [23.80, 24.60],
    exitRange: [26.40, 27.10],
    signalType: 'STRONG_BUY',
    signalLabel: '強力進場',
    entryReasons: [
      '股價約 24.5 元且殖利率高達 12.3%，平準金充足、配息穩定度極高',
      '回測季線支撐後出現帶量紅 K，買盤承接力道強勁',
      '精準鎖定高息成長股，適合小資族定期定額或逢低加碼'
    ],
    exitReasons: [
      '股價漲至 26.6 元附近接近前波高點壓力區',
      '折溢價幅度超過 +1.5%（溢價過高）時切勿追高並可先賣出',
      '完成季配息填息後可進行波段資金輪動'
    ],
    historyOffsets: [-0.45, -0.40, -0.35, -0.30, -0.20, -0.15, -0.10, -0.05, 0.0, 0.15]
  },
  {
    id: '1432',
    name: '大魯閣',
    assetType: '個股',
    category: '觀光餐旅',
    price: 21.50,
    prevClose: 21.35,
    dividend: 2.60, // 21.50 * 12.1% ≈ 2.60
    isAnnualized: false,
    predictedChangePct: 8.9,
    entryRange: [20.60, 21.65],
    exitRange: [23.20, 24.00],
    signalType: 'BUY_DIP',
    signalLabel: '分批布局',
    entryReasons: [
      '股價僅 21.5 元且綜合殖利率達 12.1%，銅板價位入門門檻極低',
      '內需消費與體驗型商場營收穩健，季線翻揚提供中期支撐',
      '適合逢綠 K 分批建立基本倉位'
    ],
    exitReasons: [
      '股東會最後過戶日前夕通常為波段高點，可趁勢調節',
      '股價逼近 23.5 元前高壓力帶時分批賣出',
      '單日週轉率超過 15% 顯示短線籌碼凌亂時先獲利了結'
    ],
    historyOffsets: [-0.35, -0.30, -0.25, -0.30, -0.20, -0.10, -0.05, -0.08, 0.0, 0.15]
  },
  {
    id: '00878',
    name: '國泰永續高股息',
    assetType: 'ETF',
    category: '高股息ETF',
    price: 23.80,
    prevClose: 23.70,
    dividend: 3.34, // 2026年累計配息 3.34 元 (顯示配息 3.34 元，殖利率依題意約 10.8%~14%)
    isAnnualized: true,
    predictedChangePct: 7.2,
    entryRange: [23.10, 23.90],
    exitRange: [25.30, 26.00],
    signalType: 'STRONG_BUY',
    signalLabel: '強力進場',
    entryReasons: [
      '國民高股息 ETF，股價約 23.8 元，2026 年累計配息 3.34 元（常態年化殖利率約 10.8% 以上）',
      '金融與 AI 伺服器雙引擎配置，波動度低、抗跌領漲特性佳',
      '目前股價處於月線附近合理買點，適合分批布局領息'
    ],
    exitReasons: [
      '短線漲幅超過 7% 觸及 25.5 元上緣壓力區時可先減碼波段部位',
      '大盤 RSI 超過 80 過熱時適度調節',
      '除息前若已提前漲足配息空間可先行停利'
    ],
    historyOffsets: [-0.30, -0.25, -0.20, -0.18, -0.15, -0.12, -0.08, -0.05, 0.0, 0.10]
  },
  {
    id: '2891',
    name: '中信金',
    assetType: '個股',
    category: '金融保險',
    price: 36.80,
    prevClose: 36.45,
    dividend: 3.24, // 36.80 * 8.8% ≈ 3.24
    isAnnualized: false,
    predictedChangePct: 7.6,
    entryRange: [35.60, 37.00],
    exitRange: [39.40, 40.50],
    signalType: 'STRONG_BUY',
    signalLabel: '強力進場',
    entryReasons: [
      '股價 36.8 元且殖利率高達 8.8%，金融股獲利王兼具高配息保護',
      '高股息 ETF 成分股核心標的，下檔有被動買盤強力護盤',
      '均線呈現多頭排列，沿 10 日線穩健墊高'
    ],
    exitReasons: [
      '挑戰 40 元大關時面臨獲利了結賣壓，可先減碼一半',
      '殖利率隨股價上漲壓縮至 7.8% 以下時吸引力下降',
      '大盤系統性風險升溫時可先鎖住金融股獲利'
    ],
    historyOffsets: [-0.75, -0.65, -0.55, -0.45, -0.40, -0.25, -0.15, -0.10, 0.0, 0.35]
  },
  {
    id: '2884',
    name: '玉山金',
    assetType: '個股',
    category: '金融保險',
    price: 28.90,
    prevClose: 28.75,
    dividend: 2.46, // 28.90 * 8.5% ≈ 2.46
    isAnnualized: false,
    predictedChangePct: 6.5,
    entryRange: [28.10, 29.00],
    exitRange: [30.60, 31.40],
    signalType: 'BUY_DIP',
    signalLabel: '分批布局',
    entryReasons: [
      '股價不到 30 元且殖利率達 8.5%，金融存股族核心首選',
      '財富管理與信用卡手續費收入雙位數成長，基本面穩健',
      '波動度低、防禦性強，適合分批布局長期領息'
    ],
    exitReasons: [
      '股價站上 30.8 元後股價淨值比偏高，可先賺波段價差',
      '外資連續大幅調節金融股時順勢停利',
      '除權息前若已提前漲足配息空間可先獲利了結'
    ],
    historyOffsets: [-0.35, -0.30, -0.25, -0.20, -0.15, -0.18, -0.10, -0.05, 0.0, 0.15]
  },

  // 三、其他熱門台股與 ETF
  {
    id: '00922',
    name: '國泰台灣領袖50',
    assetType: 'ETF',
    category: '市值型ETF',
    price: 21.80,
    prevClose: 21.65,
    dividend: 2.66, // 21.80 * 12.2% ≈ 2.66
    isAnnualized: true,
    predictedChangePct: 9.1,
    entryRange: [21.10, 21.90],
    exitRange: [23.60, 24.30],
    signalType: 'STRONG_BUY',
    signalLabel: '強力進場',
    entryReasons: [
      '股價僅 21.8 元且累計配息率達 12.2%，低單價即可參與台股前 50 大領袖企業成長',
      '含積量適中且兼具低碳轉型優勢，進可攻退可守',
      'KD 指標低檔翻揚，適合進場卡位波段與息收'
    ],
    exitReasons: [
      '股價漲至 23.8 元以上可先調節部分波段獲利部位',
      '大盤與權值股出現高檔爆量長黑時減碼避險',
      '溢價幅度超過 1% 時避免追高'
    ],
    historyOffsets: [-0.40, -0.35, -0.30, -0.25, -0.20, -0.15, -0.10, -0.05, 0.0, 0.15]
  },
  {
    id: '0056',
    name: '元大高股息',
    assetType: 'ETF',
    category: '高股息ETF',
    price: 49.50,
    prevClose: 49.20,
    dividend: 4.94, // 2026年現金股利 4.94 元 (~10.0%~10.4%)
    isAnnualized: true,
    predictedChangePct: 7.4,
    entryRange: [48.00, 49.60],
    exitRange: [52.80, 54.00],
    signalType: 'BUY_DIP',
    signalLabel: '分批布局',
    entryReasons: [
      '台股高股息鼻祖，2026 年現金股利高達 4.94 元，殖利率穩居 10% 以上',
      '連續配息與填息紀錄最悠久，成分股涵蓋 AI 與高息電子傳產',
      '回測月線不破，適合中長線分批布局'
    ],
    exitReasons: [
      '股價逼近 53.5 元前高壓力帶時可先停利波段部位',
      '殖利率隨股價大漲降至 9% 以下時放慢買進節奏',
      '完成季配息填息後可適度進行資金再平衡'
    ],
    historyOffsets: [-0.90, -0.80, -0.70, -0.55, -0.45, -0.35, -0.20, -0.10, 0.0, 0.30]
  },
  {
    id: '00981A',
    name: '主動統一台股增長',
    assetType: 'ETF',
    category: '主動型ETF',
    price: 20.20,
    prevClose: 20.05,
    dividend: 1.68, // 20.20 * 8.3% ≈ 1.68
    isAnnualized: true,
    predictedChangePct: 11.8,
    entryRange: [19.50, 20.30],
    exitRange: [22.40, 23.20],
    signalType: 'STRONG_BUY',
    signalLabel: '強力進場',
    entryReasons: [
      '主動選股靈活捕捉台股強勢成長股，年化殖利率亦達 8.3%，股價僅 20.2 元',
      '經理人主動調整 AI 供應鏈與高成長族群配置，超額報酬潛力高',
      '均線多頭排列，成交量穩步增溫'
    ],
    exitReasons: [
      '股價達到 22.6 元目標區間時可分批鎖定主動選股超額報酬',
      '短線急漲造成正乖離過大時宜分批停利',
      '市場風格轉向防禦型資產時可減碼部分部位'
    ],
    historyOffsets: [-0.50, -0.42, -0.35, -0.28, -0.22, -0.15, -0.10, -0.05, 0.0, 0.15]
  },
  {
    id: '2382',
    name: '廣達',
    assetType: '個股',
    category: 'AI伺服器',
    price: 298.00,
    prevClose: 301.50,
    dividend: 14.30, // 298 * 4.8% ≈ 14.30
    isAnnualized: false,
    predictedChangePct: 6.2,
    entryRange: [288.00, 299.00],
    exitRange: [315.00, 325.00],
    signalType: 'HOLD',
    signalLabel: '續抱領息',
    entryReasons: [
      'AI 伺服器出貨持續放量，殖利率約 4.8% 在大型電子股中表現穩健',
      '目前股價在 295~300 元區間橫盤整理，等待量能突破月線',
      '若回測 290 元季線支撐可考慮加碼'
    ],
    exitReasons: [
      '反彈至 318 元前波套牢壓力區可先獲利了結一趟',
      '若帶量跌破 285 元季線防守位則先減碼觀望',
      '法人連續大幅賣超且 MACD 翻綠時調整部位'
    ],
    historyOffsets: [4.50, 3.80, 5.00, 2.50, 3.00, 1.80, 1.20, 0.80, 0.0, -3.50]
  },
  {
    id: '006208',
    name: '富邦台50',
    assetType: 'ETF',
    category: '市值型ETF',
    price: 114.00,
    prevClose: 113.00,
    dividend: 4.10, // 殖利率約 3.6% (備註2026累計/參考高息表現)
    isAnnualized: true,
    predictedChangePct: 8.2,
    entryRange: [110.50, 114.50],
    exitRange: [122.00, 125.00],
    signalType: 'BUY_DIP',
    signalLabel: '分批布局',
    entryReasons: [
      '低內扣費用市值型 ETF 首選，完整參與台灣前 50 大企業成長紅利',
      '長期資本利得動能強勁，適合定期定額與回測月線分批布局',
      '半導體與權值股獲利持續上修提供長線保護'
    ],
    exitReasons: [
      '短線漲幅超過 9% 觸及 123 元上緣壓力區時可適度調節',
      '大盤本益比超過 22 倍歷史高位時減碼波段倉位',
      '達成年度資產配置目標報酬率後再平衡'
    ],
    historyOffsets: [-2.50, -2.10, -1.80, -1.50, -1.10, -0.80, -0.50, -0.25, 0.0, 1.00]
  },
  {
    id: '2317',
    name: '鴻海',
    assetType: '個股',
    category: 'AI伺服器',
    price: 214.00,
    prevClose: 211.50,
    dividend: 6.85, // 214 * 3.2% ≈ 6.85
    isAnnualized: false,
    predictedChangePct: 9.5,
    entryRange: [206.00, 215.00],
    exitRange: [232.00, 240.00],
    signalType: 'STRONG_BUY',
    signalLabel: '強力進場',
    entryReasons: [
      'GB200/GB300 AI 伺服器機櫃放量出貨，營收逐季創高',
      '外資與投信同步回補，股價站穩所有短中期均線',
      '大型權值股中兼具成長性與穩定配息代表'
    ],
    exitReasons: [
      '股價接近 235 元法人目標價共識區間時分批停利',
      '短線急漲導致日 KD 超過 85 並出現高檔長黑時賣出',
      'AI 供應鏈拉貨季節性轉淡前夕適度減碼'
    ],
    historyOffsets: [-5.50, -4.80, -4.00, -3.50, -2.50, -1.80, -1.20, -0.50, 0.0, 2.50]
  },
  {
    id: '0050',
    name: '元大台灣50',
    assetType: 'ETF',
    category: '市值型ETF',
    price: 196.50,
    prevClose: 195.00,
    dividend: 3.93, // 196.5 * 2.0% = 3.93
    isAnnualized: true,
    predictedChangePct: 7.9,
    entryRange: [190.00, 197.00],
    exitRange: [210.00, 215.00],
    signalType: 'HOLD',
    signalLabel: '續抱領息',
    entryReasons: [
      '台股最具代表性市值型 ETF，流動性最佳、緊貼加權指數走勢',
      '適合做為核心資產長期持有，等待回測 192 元月線支撐再加碼',
      '台積電與大型電子權值股基本面持續向上'
    ],
    exitReasons: [
      '股價挑戰 212 元壓力區且大盤乖離過大時先停利部分部位',
      '美股費半指數出現大幅修正訊號時做波段避險調節',
      '資金有高息現金流需求時可部分轉進殖利率 > 10% ETF'
    ],
    historyOffsets: [-3.80, -3.20, -2.80, -2.20, -1.60, -1.20, -0.80, -0.40, 0.0, 1.50]
  },
  {
    id: '2330',
    name: '台積電',
    assetType: '個股',
    category: '半導體業',
    price: 1065.00,
    prevClose: 1075.00,
    dividend: 19.17, // 1065 * 1.8% ≈ 19.17
    isAnnualized: false,
    predictedChangePct: 8.6,
    entryRange: [1035.00, 1070.00],
    exitRange: [1145.00, 1180.00],
    signalType: 'BUY_DIP',
    signalLabel: '分批布局',
    entryReasons: [
      '先進製程市占率絕對領先，AI 晶片需求持續供不應求，今日小幅拉回提供布局點',
      '季配息金額穩步調升，長線資本利得空間遠大於股息',
      '每次回測月線皆為長線資金絕佳分批進場時機'
    ],
    exitReasons: [
      '股價突破 1150 元且本益比超過 24 倍時可適度逢高獲利了結',
      '美股費半指數出現大幅修正訊號時先做避險減碼',
      '達到波段 10% 獲利目標後可部分停利轉入高息標的'
    ],
    historyOffsets: [-15, -10, -5, 0, 5, 10, 15, 12, 0, -10]
  }
];

// 台股價格跳動單位 (Tick Size) 規範
function getTaiwanTickSize(price) {
  if (price < 10) return 0.01;
  if (price < 50) return 0.05;
  if (price < 100) return 0.1;
  if (price < 500) return 0.5;
  if (price < 1000) return 1.0;
  return 5.0;
}

// 智能優先排序演算法：
// 第一順位：年化殖利率 >= 20%（依殖利率高到低）
// 第二順位：銅板低價高息（股價 < 40 元 且 殖利率 >= 8%，依 CP 值高到低）
// 第三順位：其餘標的（依殖利率高到低）
function calculatePriorityScore(stock) {
  const yieldPct = (stock.dividend / stock.price) * 100;

  if (yieldPct >= 20) {
    // 第一順位區間：100,000 分起跳，依殖利率高到低排列
    return 100000 + yieldPct * 100;
  }

  if (stock.price < 40 && yieldPct >= 8) {
    // 第二順位區間：50,000 分起跳，依綜合 CP 值（高殖利率 + 低股價優勢）排列
    const cpValue = yieldPct * 120 + (40 - stock.price) * 25;
    return 50000 + cpValue;
  }

  // 第三順位區間：依殖利率高到低排列
  return yieldPct * 100;
}

// 近 10 日走勢 + 未來 30 日 AI 預測區間折線圖 (SVG)
function PriceForecastChart({ stock }) {
  const isBullish = stock.predictedChangePct >= 0;

  const historyPoints = useMemo(() => {
    return stock.historyOffsets.map((offset, idx) => {
      const val = idx === 9 ? stock.price : Math.max(1, stock.prevClose + offset);
      return { day: idx - 9, price: val };
    });
  }, [stock]);

  const forecastPoints = useMemo(() => {
    const targetPrice = stock.price * (1 + stock.predictedChangePct / 100);
    const steps = 6;
    const pts = [{ day: 0, price: stock.price, upper: stock.price, lower: stock.price }];

    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const wave = Math.sin(progress * Math.PI) * (stock.price * 0.012);
      const midPrice = stock.price + (targetPrice - stock.price) * progress + wave;
      const spread = stock.price * (0.016 * Math.sqrt(i));
      pts.push({
        day: i * 5,
        price: midPrice,
        upper: midPrice + spread,
        lower: Math.max(0.5, midPrice - spread)
      });
    }
    return pts;
  }, [stock]);

  const allValues = [
    ...historyPoints.map((p) => p.price),
    ...forecastPoints.map((p) => p.upper),
    ...forecastPoints.map((p) => p.lower),
    stock.entryRange[0],
    stock.exitRange[1]
  ];
  const minPrice = Math.min(...allValues) * 0.985;
  const maxPrice = Math.max(...allValues) * 1.015;
  const priceSpan = maxPrice - minPrice || 1;

  const width = 560;
  const height = 240;
  const padLeft = 52;
  const padRight = 22;
  const padTop = 26;
  const padBottom = 32;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (day) => padLeft + ((day + 9) / 39) * chartW;
  const getY = (price) => padTop + chartH - ((price - minPrice) / priceSpan) * chartH;

  const historyPath = historyPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.day).toFixed(1)} ${getY(p.price).toFixed(1)}`)
    .join(' ');

  const forecastPath = forecastPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.day).toFixed(1)} ${getY(p.price).toFixed(1)}`)
    .join(' ');

  const upperCoords = forecastPoints.map((p) => `${getX(p.day).toFixed(1)},${getY(p.upper).toFixed(1)}`);
  const lowerCoords = [...forecastPoints]
    .reverse()
    .map((p) => `${getX(p.day).toFixed(1)},${getY(p.lower).toFixed(1)}`);
  const bandPoints = [...upperCoords, ...lowerCoords].join(' ');

  const todayX = getX(0);
  const todayY = getY(stock.price);
  const endPoint = forecastPoints[forecastPoints.length - 1];
  const endX = getX(endPoint.day);
  const endY = getY(endPoint.price);

  const entryLineY = getY(stock.entryRange[0]);
  const exitLineY = getY(stock.exitRange[1]);

  const yTicks = [0, 0.33, 0.66, 1].map((ratio) => minPrice + priceSpan * ratio);
  const trendColor = isBullish ? '#ef4444' : '#10b981';
  const bandFill = isBullish ? 'rgba(239, 68, 68, 0.16)' : 'rgba(16, 185, 129, 0.16)';

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-amber-400" />
          <span className="text-xs sm:text-sm font-bold text-slate-200">
            近 10 日走勢 ＋ 未來 30 日 AI 預測區間圖
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2.5 h-0.5 bg-sky-400 inline-block"></span>
            歷史走勢
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <span
              className="w-2.5 h-0.5 border-t-2 border-dashed inline-block"
              style={{ borderColor: trendColor }}
            ></span>
            AI 預測 ({isBullish ? '+' : ''}
            {stock.predictedChangePct.toFixed(1)}%)
          </span>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          {/* Y 軸水平參考線 */}
          {yTicks.map((val, idx) => {
            const y = getY(val);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10.5"
                  fontFamily="monospace"
                >
                  {val >= 100 ? val.toFixed(0) : val.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* 目標停利線 */}
          <line
            x1={padLeft}
            y1={exitLineY}
            x2={width - padRight}
            y2={exitLineY}
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.7"
          />
          <text
            x={width - padRight - 4}
            y={exitLineY - 4}
            textAnchor="end"
            fill="#fbbf24"
            fontSize="10"
            fontFamily="monospace"
          >
            停利目標 {stock.exitRange[1]}
          </text>

          {/* 進場支撐線 */}
          <line
            x1={padLeft}
            y1={entryLineY}
            x2={width - padRight}
            y2={entryLineY}
            stroke="#38bdf8"
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity="0.65"
          />
          <text
            x={padLeft + 4}
            y={entryLineY - 4}
            textAnchor="start"
            fill="#7dd3fc"
            fontSize="10"
            fontFamily="monospace"
          >
            支撐進場 {stock.entryRange[0]}
          </text>

          {/* AI 預測置信區間 */}
          <polygon points={bandPoints} fill={bandFill} />

          {/* 今日垂直分隔線 */}
          <line
            x1={todayX}
            y1={padTop}
            x2={todayX}
            y2={height - padBottom}
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <text
            x={todayX}
            y={padTop - 8}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="10.5"
            fontWeight="600"
          >
            今日現價
          </text>

          {/* 歷史 10 日折線 */}
          <path
            d={historyPath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 未來 30 日預測折線 */}
          <path
            d={forecastPath}
            fill="none"
            stroke={trendColor}
            strokeWidth="2.5"
            strokeDasharray="5 4"
            strokeLinecap="round"
          />

          {/* 節點標示 */}
          <circle cx={todayX} cy={todayY} r="4.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
          <circle cx={endX} cy={endY} r="4.5" fill={trendColor} stroke="#0f172a" strokeWidth="2" />
          <text
            x={endX - 6}
            y={endY - 9}
            textAnchor="end"
            fill={trendColor}
            fontSize="11"
            fontWeight="bold"
            fontFamily="monospace"
          >
            30日預估 {endPoint.price >= 100 ? endPoint.price.toFixed(1) : endPoint.price.toFixed(2)}
          </text>

          {/* X 軸時間刻度 */}
          <text x={getX(-9)} y={height - 10} textAnchor="start" fill="#64748b" fontSize="10.5">
            10日前
          </text>
          <text x={todayX} y={height - 10} textAnchor="middle" fill="#cbd5e1" fontSize="10.5">
            今天
          </text>
          <text x={getX(15)} y={height - 10} textAnchor="middle" fill="#64748b" fontSize="10.5">
            +15日
          </text>
          <text x={getX(30)} y={height - 10} textAnchor="end" fill="#94a3b8" fontSize="10.5">
            +30日
          </text>
        </svg>
      </div>
    </div>
  );
}

export default function App() {
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [isAutoUpdating, setIsAutoUpdating] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [flashingIds, setFlashingIds] = useState({});

  // 搜尋、篩選與排序狀態
  const [searchQuery, setSearchQuery] = useState('');
  const [assetFilter, setAssetFilter] = useState('ALL'); // 'ALL' | 'ETF' | 'STOCK'
  const [highlightFilter, setHighlightFilter] = useState('ALL'); // 'ALL' | 'YIELD_20' | 'LOW_PRICE_HIGH_YIELD'
  const [sortBy, setSortBy] = useState('PRIORITY'); // 預設：智能優先

  // 選中深度診斷的股票 ID（預設選中第一檔 00892 方便桌面版即時檢視右側面板）
  const [selectedStockId, setSelectedStockId] = useState('00892');
  const [lotCount, setLotCount] = useState(2); // 預設試算 2 張

  // 每 4 秒模擬即時盤中報價跳動引擎（遵循台股 Tick Size）
  const triggerMarketUpdate = () => {
    const newFlashes = {};
    setStocks((prevStocks) =>
      prevStocks.map((stock) => {
        if (Math.random() > 0.68) return stock;

        const tick = getTaiwanTickSize(stock.price);
        const bias = stock.predictedChangePct > 0 ? 0.12 : -0.12;
        const stepMultiplier = Math.floor((Math.random() - 0.48 + bias) * 3);
        if (stepMultiplier === 0) return stock;

        const rawNewPrice = stock.price + stepMultiplier * tick;
        const maxUp = stock.prevClose * 1.095;
        const maxDown = stock.prevClose * 0.905;
        const clampedPrice = Number(
          Math.min(maxUp, Math.max(maxDown, rawNewPrice)).toFixed(2)
        );

        if (clampedPrice !== stock.price) {
          newFlashes[stock.id] = clampedPrice > stock.price ? 'UP' : 'DOWN';
        }

        const predDelta = Number(((Math.random() - 0.5) * 0.2).toFixed(1));
        const newPredictedPct = Number((stock.predictedChangePct + predDelta).toFixed(1));

        return {
          ...stock,
          price: clampedPrice,
          predictedChangePct: newPredictedPct
        };
      })
    );

    setLastUpdated(new Date());
    setFlashingIds(newFlashes);
    setTimeout(() => {
      setFlashingIds({});
    }, 650);
  };

  useEffect(() => {
    if (!isAutoUpdating) return;
    const timer = setInterval(() => {
      triggerMarketUpdate();
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoUpdating]);

  // 計算統計數據
  const stats = useMemo(() => {
    let etfCount = 0;
    let stockCount = 0;
    let yield20Count = 0;
    let lowPriceHighYieldCount = 0;

    stocks.forEach((s) => {
      if (s.assetType === 'ETF') etfCount++;
      else stockCount++;

      const y = (s.dividend / s.price) * 100;
      if (y >= 20) yield20Count++;
      if (s.price < 40 && y >= 8) lowPriceHighYieldCount++;
    });

    return {
      total: stocks.length,
      etfCount,
      stockCount,
      yield20Count,
      lowPriceHighYieldCount
    };
  }, [stocks]);

  // 過濾與排序後的標的清單
  const filteredAndSortedStocks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = stocks.filter((stock) => {
      const yieldPct = (stock.dividend / stock.price) * 100;

      // 1. 類型篩選（全部 / 僅看 ETF / 僅看個股）
      if (assetFilter === 'ETF' && stock.assetType !== 'ETF') return false;
      if (assetFilter === 'STOCK' && stock.assetType !== '個股') return false;

      // 2. 高息亮點篩選
      if (highlightFilter === 'YIELD_20' && yieldPct < 20) return false;
      if (highlightFilter === 'LOW_PRICE_HIGH_YIELD' && !(stock.price < 40 && yieldPct >= 8)) {
        return false;
      }

      // 3. 即時搜尋（代號、名稱、類型 ETF/個股、產業）
      if (q) {
        const matchId = stock.id.toLowerCase().includes(q);
        const matchName = stock.name.toLowerCase().includes(q);
        const matchAsset = stock.assetType.toLowerCase().includes(q);
        const matchCat = stock.category.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchAsset && !matchCat) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      const yieldA = (a.dividend / a.price) * 100;
      const yieldB = (b.dividend / b.price) * 100;

      switch (sortBy) {
        case 'YIELD_DESC':
          return yieldB - yieldA;
        case 'PRICE_ASC':
          return a.price - b.price;
        case 'PREDICTED_DESC':
          return b.predictedChangePct - a.predictedChangePct;
        case 'PRIORITY':
        default:
          return calculatePriorityScore(b) - calculatePriorityScore(a);
      }
    });
  }, [stocks, searchQuery, assetFilter, highlightFilter, sortBy]);

  // 當前選中進行深度診斷的標的
  const selectedStock = useMemo(
    () => stocks.find((s) => s.id === selectedStockId) || filteredAndSortedStocks[0] || null,
    [stocks, selectedStockId, filteredAndSortedStocks]
  );

  // 渲染操作訊號標籤（強力進場、分批布局、續抱領息、逢高獲利了結）
  const renderSignalBadge = (signalType, label) => {
    switch (signalType) {
      case 'STRONG_BUY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-500/20 text-red-400 border border-red-500/40">
            <TrendingUp className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      case 'BUY_DIP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Target className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      case 'TAKE_PROFIT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <TrendingDown className="w-3.5 h-3.5" />
            {label}
          </span>
        );
      case 'HOLD':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
            <Clock className="w-3.5 h-3.5" />
            {label}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* 頂部即時看盤導覽列 */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3.5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/20 shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white">
                  台股與ETF高息智能觀測站
                </h1>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  2026 即時雷達版
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                自動置頂 ≥20% 超高息與銅板低價高息標的・涵蓋台股個股與熱門 ETF・台股紅漲綠跌標準
              </p>
            </div>
          </div>

          {/* 即時更新引擎控制區 */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                {isAutoUpdating && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isAutoUpdating ? 'bg-emerald-500' : 'bg-slate-500'
                  }`}
                ></span>
              </span>
              <span className={isAutoUpdating ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                {isAutoUpdating ? '即時行情更新中 (4秒)' : '行情自動更新已暫停'}
              </span>
              <span className="text-slate-500 font-mono">
                | {lastUpdated.toLocaleTimeString('zh-TW', { hour12: false })}
              </span>
            </div>

            <button
              onClick={() => setIsAutoUpdating((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
            >
              {isAutoUpdating ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  暫停更新
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  繼續更新
                </>
              )}
            </button>

            <button
              onClick={triggerMarketUpdate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-md shadow-red-600/20 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              手動刷新
            </button>
          </div>
        </div>
      </header>

      {/* 主工作區 */}
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 pt-5 pb-12 flex-1 space-y-5">
        {/* 搜尋與多維度篩選控制面板 */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* 即時搜尋欄 */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="即時搜尋代號、名稱、類型或產業（例如：00878、2330、國泰永續、台積電、ETF、個股、金融、半導體...）"
                className="w-full pl-10 pr-9 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 排序切換選單 */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <ArrowUpDown className="w-4 h-4 text-amber-400" />
                <span>排序方式：</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="PRIORITY">智能優先（≥20% & 低價高息）</option>
                <option value="YIELD_DESC">殖利率由高到低</option>
                <option value="PRICE_ASC">股價由低到高</option>
                <option value="PREDICTED_DESC">AI 預估漲幅最高</option>
              </select>
            </div>
          </div>

          {/* 雙層快速篩選列：標的類型（全部 / 僅看 ETF / 僅看個股） + 高息焦點篩選 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
            {/* 標的類型篩選按鈕組 */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                標的分類：
              </span>
              {[
                { id: 'ALL', label: '全部', count: stats.total },
                { id: 'ETF', label: '僅看 ETF', count: stats.etfCount },
                { id: 'STOCK', label: '僅看個股', count: stats.stockCount }
              ].map((item) => {
                const active = assetFilter === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setAssetFilter(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? 'bg-sky-500 text-slate-950 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={`px-1.5 rounded text-[11px] font-mono ${
                        active ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 高息與低價高息快速篩選 */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'ALL', label: '不限高息條件' },
                {
                  id: 'YIELD_20',
                  label: `🔥 ≥20% 超高息 (${stats.yield20Count})`
                },
                {
                  id: 'LOW_PRICE_HIGH_YIELD',
                  label: `💎 低價高息 <40元 (${stats.lowPriceHighYieldCount})`
                }
              ].map((hl) => {
                const active = highlightFilter === hl.id;
                return (
                  <button
                    key={hl.id}
                    onClick={() => setHighlightFilter(hl.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      active
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {hl.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 核心雙欄佈局：左側行情與智能排序列表 / 右側 AI 深度診斷與進出場策略面板 */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* 左側列表區 (7欄) */}
          <div className="xl:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1 text-xs text-slate-400">
              <span>
                共篩選出 <strong className="text-white font-mono">{filteredAndSortedStocks.length}</strong> 檔標的（點擊任一項目切換右側 AI 深度診斷與試算）
              </span>
              <span className="hidden sm:inline text-slate-500">紅漲綠跌・每 4 秒更新</span>
            </div>

            {filteredAndSortedStocks.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
                <Search className="w-9 h-9 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-200">找不到符合條件的股票或 ETF</h3>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setAssetFilter('ALL');
                    setHighlightFilter('ALL');
                  }}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition cursor-pointer"
                >
                  清除所有篩選條件
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredAndSortedStocks.map((stock) => {
                  const change = stock.price - stock.prevClose;
                  const changePct = (change / stock.prevClose) * 100;
                  const yieldPct = (stock.dividend / stock.price) * 100;
                  const isSuperYield = yieldPct >= 20;
                  const isLowPriceHighYield = stock.price < 40 && yieldPct >= 8;
                  const isSelected = selectedStock?.id === stock.id;
                  const flashState = flashingIds[stock.id];

                  const priceColor =
                    change > 0
                      ? 'text-red-400'
                      : change < 0
                      ? 'text-emerald-400'
                      : 'text-slate-200';
                  const predColor =
                    stock.predictedChangePct >= 0 ? 'text-red-400' : 'text-emerald-400';

                  const predMinPrice =
                    stock.price * (1 + (stock.predictedChangePct - 2.2) / 100);
                  const predMaxPrice =
                    stock.price * (1 + (stock.predictedChangePct + 2.2) / 100);

                  return (
                    <div
                      key={stock.id}
                      onClick={() => setSelectedStockId(stock.id)}
                      className={`rounded-2xl p-3.5 sm:p-4 border transition cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 border-amber-500 ring-1 ring-amber-500/40 shadow-lg shadow-amber-500/10'
                          : isSuperYield
                          ? 'bg-slate-900/90 border-amber-500/35 hover:border-amber-400/70'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* 左側：代號、名稱、個股/ETF標籤與高息優先徽章 */}
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[11px] font-extrabold px-2 py-0.5 rounded ${
                                stock.assetType === 'ETF'
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                                  : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                              }`}
                            >
                              {stock.assetType}
                            </span>
                            <span className="font-mono font-extrabold text-amber-400 text-base">
                              {stock.id}
                            </span>
                            <span className="font-bold text-white text-base">{stock.name}</span>
                            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              {stock.category}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {isSuperYield && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-extrabold bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-sm">
                                🔥 ≥20% 超高息
                              </span>
                            )}
                            {isLowPriceHighYield && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                                💎 低價高息
                              </span>
                            )}
                            {renderSignalBadge(stock.signalType, stock.signalLabel)}
                          </div>
                        </div>

                        {/* 右側：即時股價、殖利率與 AI 30日預測數據 */}
                        <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 font-mono">
                          {/* 當前股價 */}
                          <div className="text-left sm:text-right">
                            <div className="text-[11px] text-slate-500 font-sans">即時股價</div>
                            <div
                              className={`inline-block px-1.5 py-0.5 rounded font-extrabold text-base transition-colors duration-500 ${priceColor} ${
                                flashState === 'UP'
                                  ? 'bg-red-500/25'
                                  : flashState === 'DOWN'
                                  ? 'bg-emerald-500/25'
                                  : ''
                              }`}
                            >
                              {stock.price >= 100
                                ? stock.price.toFixed(1)
                                : stock.price.toFixed(2)}
                            </div>
                            <div className={`text-[11px] font-semibold ${priceColor}`}>
                              {change > 0 ? '▲' : change < 0 ? '▼' : '▬'}{' '}
                              {Math.abs(change).toFixed(2)} ({change > 0 ? '+' : ''}
                              {changePct.toFixed(2)}%)
                            </div>
                          </div>

                          {/* 預估年股息與殖利率 */}
                          <div className="text-center sm:text-right">
                            <div className="text-[11px] text-slate-500 font-sans">預估殖利率</div>
                            <div
                              className={`text-base font-extrabold ${
                                isSuperYield
                                  ? 'text-amber-400'
                                  : yieldPct >= 8
                                  ? 'text-rose-400'
                                  : 'text-slate-200'
                              }`}
                            >
                              {yieldPct.toFixed(2)}%
                            </div>
                            <div className="text-[11px] text-slate-400">
                              年息 {stock.dividend.toFixed(2)}元
                            </div>
                          </div>

                          {/* AI 未來 30 日預測 */}
                          <div className="text-right">
                            <div className="text-[11px] text-slate-500 font-sans">AI 30日預測</div>
                            <div className={`text-base font-extrabold ${predColor}`}>
                              {stock.predictedChangePct > 0 ? '+' : ''}
                              {stock.predictedChangePct.toFixed(1)}%
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {predMinPrice >= 100
                                ? `${predMinPrice.toFixed(0)}~${predMaxPrice.toFixed(0)}`
                                : `${predMinPrice.toFixed(1)}~${predMaxPrice.toFixed(1)}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 右側（手機版下方）：AI 深度診斷與進出場策略面板 (5欄) */}
          <div className="xl:col-span-5 xl:sticky xl:top-20">
            {selectedStock && (
              <div className="bg-slate-900 border border-slate-700/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl">
                {/* 面板標題 */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3.5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                          selectedStock.assetType === 'ETF'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        }`}
                      >
                        {selectedStock.assetType}
                      </span>
                      <span className="font-mono text-lg font-extrabold text-amber-400">
                        {selectedStock.id}
                      </span>
                      <h2 className="text-xl font-extrabold text-white">{selectedStock.name}</h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      AI 深度診斷與進出場策略面板・即時現價{' '}
                      <span className="font-mono font-bold text-white">
                        {selectedStock.price.toFixed(2)} 元
                      </span>
                    </p>
                  </div>

                  <div>{renderSignalBadge(selectedStock.signalType, selectedStock.signalLabel)}</div>
                </div>

                {/* 近 10 日走勢 + 未來 30 日 AI 預測區間折線圖 */}
                <PriceForecastChart stock={selectedStock} />

                {/* 建議進場價位區間與進場條件 */}
                <div className="bg-slate-950/80 border border-red-500/30 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-red-400 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>建議進場價位與條件</span>
                    </div>
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                      進場區間：{selectedStock.entryRange[0]} ~ {selectedStock.entryRange[1]} 元
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                    {selectedStock.entryReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 建議賣出 / 停利價位區間與賣出條件 */}
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                      <ShieldAlert className="w-4 h-4" />
                      <span>建議賣出 / 停利價位與條件</span>
                    </div>
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      停利區間：{selectedStock.exitRange[0]} ~ {selectedStock.exitRange[1]} 元
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                    {selectedStock.exitReasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 存股領息與價差試算器 */}
                {(() => {
                  const safeLots = Math.max(1, Number(lotCount) || 1);
                  const shares = safeLots * 1000;
                  const totalCost = shares * selectedStock.price;
                  const annualDividendTotal = shares * selectedStock.dividend;
                  const targetPrice =
                    selectedStock.price * (1 + selectedStock.predictedChangePct / 100);
                  const capitalGain = shares * (targetPrice - selectedStock.price);
                  const totalReturn = annualDividendTotal + capitalGain;
                  const totalReturnPct = (totalReturn / totalCost) * 100;

                  return (
                    <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700 rounded-xl p-3.5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Calculator className="w-4 h-4 text-amber-400" />
                          <h3 className="text-sm font-bold text-white">存股領息與價差試算器</h3>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {[1, 2, 5, 10].map((preset) => (
                            <button
                              key={preset}
                              onClick={() => setLotCount(preset)}
                              className={`px-2 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                                safeLots === preset
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {preset}張
                            </button>
                          ))}
                          <input
                            type="number"
                            min="1"
                            max="999"
                            value={lotCount}
                            onChange={(e) => setLotCount(e.target.value)}
                            aria-label="買進張數"
                            className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-white text-center focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 font-mono">
                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                          <div className="text-[11px] text-slate-400 font-sans">
                            總投入成本（{safeLots}張={shares.toLocaleString()}股）
                          </div>
                          <div className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                            NT$ {Math.round(totalCost).toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-slate-950 border border-amber-500/30 rounded-lg p-2.5">
                          <div className="text-[11px] text-amber-300/90 font-sans">
                            預估年領股息金額
                          </div>
                          <div className="text-sm sm:text-base font-extrabold text-amber-400 mt-0.5">
                            +NT$ {Math.round(annualDividendTotal).toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                          <div className="text-[11px] text-slate-400 font-sans">
                            達 AI 目標價預估價差
                          </div>
                          <div
                            className={`text-sm sm:text-base font-extrabold mt-0.5 ${
                              capitalGain >= 0 ? 'text-red-400' : 'text-emerald-400'
                            }`}
                          >
                            {capitalGain >= 0 ? '+NT$ ' : '-NT$ '}
                            {Math.abs(Math.round(capitalGain)).toLocaleString()}
                          </div>
                        </div>

                        <div className="bg-slate-950 border border-red-500/30 rounded-lg p-2.5">
                          <div className="text-[11px] text-slate-300 font-sans">
                            預估總報酬（股息+價差）
                          </div>
                          <div
                            className={`text-sm sm:text-base font-extrabold mt-0.5 ${
                              totalReturn >= 0 ? 'text-red-400' : 'text-emerald-400'
                            }`}
                          >
                            {totalReturn >= 0 ? '+NT$ ' : '-NT$ '}
                            {Math.abs(Math.round(totalReturn)).toLocaleString()} (
                            {totalReturnPct >= 0 ? '+' : ''}
                            {totalReturnPct.toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 頁面底部合規免責聲明 */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            本工具提供模擬即時報價跳動與歷史配息參考，AI 漲跌預測與進出場價位僅供研究與教學參考，不構成任何投資買賣建議。
          </span>
        </div>
      </footer>
    </div>
  );
}