/* Стаття 38 «Види кави»: знімок даних на 27.10.2026. Кожне число — значення · дата · джерело (повний список — у розділі «Джерела»).
   Види: Kew Bulletin 2021 (130 відомих видів, Davis & Rakotonasolo); оцінка загрози — Davis et al. 2019, Science Advances (124 види).
   Гібрид арабіки — Salojärvi et al. 2024, Nature Genetics. Хімія зеленого зерна — Ky et al. 2001, Food Chemistry (кофеїн, сахароза),
   огляд ScienceDirect «Coffea canephora» (хлорогенові кислоти, сахароза 73/45 мг/г). Клімат — Kath et al. 2020, Global Change Biology (робуста),
   Davis et al. 2021, Nature Plants (стенофіла), регіональна оцінка для арабіки 18–21 °C. Ринок — USDA FAS «Coffee: World Markets and Trade», 12/2025;
   ціни ICE на 23.10.2026; аукціон Best of Panama 2025. */
window.CF = {
  date: '27.10.2026',
  // 01 · види: оцінка IUCN 2019 (124 види) + 6 видів, описаних 2021 року (не оцінені)
  threat: { assessed: 124, CR: 13, EN: 40, VU: 22, LC: 35, DD: 14, newer: 6, total: 130 },
  where: { madagascar: 65, africa: 48, other: 17 },   // Kew Bulletin 2021 через Sprudge; «інші» — Азія й Австралія (130 − 65 − 48)
  // культурні й «цікаві» види — для карток
  species: [
    { id: 'ara', n: 'Арабіка', lat: 'Coffea arabica', st: 'EN', share: '≈ 54–57 %', chr: 44, note: 'гібрид двох видів; росте в горах; майже вся «спешелті»' },
    { id: 'can', n: 'Робуста', lat: 'Coffea canephora', st: 'LC', share: '≈ 43–46 %', chr: 22, note: 'низини, жара, більше кофеїну; один із батьків арабіки' },
    { id: 'eug', n: 'Еугеніоїдес', lat: 'Coffea eugenioides', st: 'LC', share: 'майже 0', chr: 22, note: 'другий батько арабіки; дикий вид Східної Африки' },
    { id: 'lib', n: 'Ліберика', lat: 'Coffea liberica', st: 'LC', share: '< 1–2 %', chr: 22, note: 'великі зерна; з 2025 року — три окремі види' },
    { id: 'ste', n: 'Стенофіла', lat: 'Coffea stenophylla', st: 'VU', share: 'дослідні ділянки', chr: 22, note: 'смак як у доброї арабіки, витримує +6,8 °C' }
  ],
  // 02 · походження арабіки
  hybrid: { from: 1.08, to: 0.543, unit: 'млн років тому' },
  // 03 · хімія зеленого зерна (на суху масу)
  chem: {
    caf: { ara: 1.22, can: 2.54, u: '%', src: 'Ky et al. 2001' },
    suc: { ara: 7.3, can: 4.5, u: '%', src: 'огляд: 73 і 45 мг/г' },
    cga: { ara: [5, 6], can: [7, 9], u: 'г/100 г', src: 'огляд ScienceDirect' }
  },
  // 04 · клімат: оптимум середньорічної температури, °C
  clim: { ara: [18, 21], can: 20.5, canOld: [22, 30], canLoss: 14, ste: 24.9, steVsAra: 6.8, steVsCan: 1.9 },
  // 07 · обсмажування
  roast: { maillard: [140, 150], crack1: 200 },
  // 08 · ринок 2025/26 (USDA FAS, 12/2025), млн мішків по 60 кг
  market: { world: 178.8, brazil: 63.0, brAra: 38.0, brCan: 25.0, vietnam: 31.7, indoCan: 11.0, araShare: 54, canShare: 46 },
  price: { araCentsLb: 307.45, canUsdT: 3228, priceDate: '23.10.2026', gesha: 30204, geshaYear: 2025, geshaLot: 20 }
};
