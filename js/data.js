/* ================================================
   DIGITINHO — js/data.js
   Game configuration, pools, and definitions
   ================================================ */
'use strict';

const CFG = {
  baseSpeed: 52,
  speedBonusLetter: 0.008,
  speedBonusSyl: 0.02,
  speedBonusWord: 0.04,
  speedErrorPenalty: 0.1,   // +0.1x per typo error
  maxSpeedMult: 4.0,
  spawnBase: 2100,
  spawnMin: 500,
  spawnVariance: 650,
  freezerMaxItems: 3, // Limite máximo de rúnicos simultâneos na tela com Freezer ativo
  hasteSpeedBonus: 0.5, // Aumento relativo (+0.5) de velocidade com a habilidade Pontos em Dobro
  padX: 14,
  progressPenalty: 3,
  startLives: 3,
  wordsPerPhase: 3,
  wordSkillChance: 0.06,  // Rare on words — primary source is the shop
  wildcardChance: 0.04,  // Chance of spawning a wildcard word
  shopEvery: 3,     // Shop appears every N completed phases
  shopPriceFactor: 1.45,  // Exponential price escalation
  queueSize: 6,     // Items previewed in the bottom queue
};

// ================================================
// DIFFICULTY PRESETS & CONFIGURATION
// ================================================
const DIFFICULTY_CONFIG = {
  easy: {
    id: 'easy',
    name: 'Fácil',
    initialSpeed: 0.5,
    speedErrorPenalty: 0,
    progressErrorPenalty: 0,
    startLives: 5,
  },
  normal: {
    id: 'normal',
    name: 'Médio',
    initialSpeed: 1.0,
    speedErrorPenalty: 0,
    progressErrorPenalty: 3,
    startLives: 3,
  },
  hard: {
    id: 'hard',
    name: 'Difícil',
    initialSpeed: 1.5,
    speedErrorPenalty: 0.05,
    progressErrorPenalty: 3,
    startLives: 3,
  },
};

// Phase goal: Phase 1 = 10, Phase 2 = 20, Phase 3 = 30, Phase 4 = 40, Phase 5 = 50, Phase 6 = 60... (+10 per phase)
function calcPhaseGoal(phase) {
  const p = Math.max(1, parseInt(phase, 10) || 1);
  return p * 10;
}

// ================================================
// MULTI-LANGUAGE SYLLABLE POOLS
// ================================================
const SYLLABLE_POOLS = {
  en: [
    'th', 'sh', 'ch', 'in', 'on', 'er', 're', 'at', 'it', 'to', 'an', 'en',
    'he', 'is', 'or', 'ti', 'as', 'te', 'et', 'ng', 'ed', 'nd', 'ou', 'ea',
    'st', 'ar', 'al', 'se', 'nt', 'ha', 'pro', 'con', 'com', 'dis', 'pre', 'sub'
  ],
  pt: [
    'ca', 'de', 'ma', 're', 'la', 'sa', 'fi', 'no', 'pe', 'to', 'me',
    'bi', 'ro', 'tu', 'vi', 'ge', 'lo', 'pa', 'su', 'ta', 'mi', 'na', 'co',
    'ba', 'do', 'fe', 'li', 'ni', 'po', 'ra', 'si', 'va', 'ze', 'bu', 'di',
    'pra', 'bra', 'fra', 'gra', 'tra', 'cra', 'fle', 'gre', 'pro', 'clo'
  ],
  fr: [
    'de', 'la', 'le', 're', 'en', 'on', 'ou', 'an', 'te', 'es', 'se', 'in',
    'ch', 'qu', 'co', 'pa', 'ti', 'me', 'ne', 'li', 'ro', 'fi', 'va', 'bl',
    'tr', 'pr', 'cr', 'pl', 'fl', 'cl', 'br', 'gr', 'dr', 'par', 'con', 'pro'
  ],
  de: [
    'de', 'en', 'er', 'te', 'in', 'ch', 'un', 'an', 're', 'st', 'ge', 'ne',
    'li', 'be', 'da', 'so', 'ma', 'mi', 'au', 'ei', 'sch', 'ver', 'ent', 'zer'
  ],
  ja: [
    'ka', 'ki', 'ku', 'ke', 'ko', 'sa', 'shi', 'su', 'se', 'so',
    'ta', 'chi', 'tsu', 'te', 'to', 'na', 'ni', 'nu', 'ne', 'no',
    'ha', 'hi', 'fu', 'he', 'ho', 'ma', 'mi', 'mu', 'me', 'mo',
    'ya', 'yu', 'yo', 'ra', 'ri', 'ru', 're', 'ro', 'wa', 'wo'
  ],
  ko: [
    'ga', 'na', 'da', 'ra', 'ma', 'ba', 'sa', 'ah', 'ja', 'cha',
    'ka', 'ta', 'pa', 'ha', 'go', 'no', 'do', 'ro', 'mo', 'bo',
    'so', 'oh', 'jo', 'cho', 'ko', 'to', 'po', 'ho', 'su', 'woo'
  ],
  zh: [
    'ba', 'pa', 'ma', 'fa', 'da', 'ta', 'na', 'la', 'ga', 'ka', 'ha',
    'ji', 'qi', 'xi', 'zhi', 'chi', 'shi', 'ri', 'zi', 'ci', 'si',
    'de', 'le', 'me', 'ne', 'ge', 'he', 'bo', 'po', 'mo', 'fo'
  ]
};

// ================================================
// MULTI-LANGUAGE WORD POOLS (30 rich words each)
// ================================================
const WORD_POOLS = {
  en: [
    { text: 'cat', type: 'animal', meaning: 'Small carnivorous mammal with soft fur and playful paws' },
    { text: 'house', type: 'place', meaning: 'A building for human habitation and family shelter' },
    { text: 'love', type: 'feeling', meaning: 'An intense feeling of deep affection and care' },
    { text: 'ball', type: 'object', meaning: 'A spherical round object used in games and sports' },
    { text: 'fire', type: 'element', meaning: 'Combustion emitting bright light and intense heat' },
    { text: 'wind', type: 'nature', meaning: 'The natural movement of air blowing across the land' },
    { text: 'window', type: 'place', meaning: 'An opening in the wall of a building fitted with glass' },
    { text: 'wolf', type: 'animal', meaning: 'A wild carnivorous canine living in packs that howls' },
    { text: 'stone', type: 'nature', meaning: 'Hard solid mineral matter of which rocks are formed' },
    { text: 'field', type: 'nature', meaning: 'An open area of green land with crops or pastures' },
    { text: 'rain', type: 'nature', meaning: 'Moisture condensed from the clouds falling in drops' },
    { text: 'earth', type: 'nature', meaning: 'The planet on which we live; soil and terra firma' },
    { text: 'night', type: 'time', meaning: 'The period of darkness between sunset and sunrise' },
    { text: 'star', type: 'cosmos', meaning: 'A luminous celestial point glowing in the night sky' },
    { text: 'dragon', type: 'fantasy', meaning: 'A mythical winged monster that breathes blazing fire' },
    { text: 'fox', type: 'animal', meaning: 'A clever mammal with reddish coat and bushy tail' },
    { text: 'city', type: 'place', meaning: 'A large bustling urban center with streets and buildings' },
    { text: 'forest', type: 'nature', meaning: 'A large expanse of land covered densely with trees' },
    { text: 'planet', type: 'cosmos', meaning: 'A celestial body orbiting gracefully around a star' },
    { text: 'sword', type: 'object', meaning: 'A forged metal weapon with a long gleaming blade' },
    { text: 'crystal', type: 'object', meaning: 'A precious translucent mineral reflecting pure light' },
    { text: 'volcano', type: 'nature', meaning: 'A mountain with a crater spewing incandescent lava' },
    { text: 'ocean', type: 'nature', meaning: 'An immense body of salt water covering the globe' },
    { text: 'snake', type: 'animal', meaning: 'A long limbless slithering reptile of agility' },
    { text: 'thunder', type: 'nature', meaning: 'A booming sonic crash echoing after lightning flashes' },
    { text: 'light', type: 'cosmos', meaning: 'The radiant natural agent that illuminates the universe' },
    { text: 'horse', type: 'animal', meaning: 'A noble galloping mammal with an elegant flowing mane' },
    { text: 'cloud', type: 'nature', meaning: 'A floating mass of condensed vapor drifting in the sky' },
    { text: 'lion', type: 'animal', meaning: 'A majestic feline ruler known as the king of the jungle' },
    { text: 'lake', type: 'nature', meaning: 'A peaceful body of fresh water surrounded by land' }
  ],
  pt: [
    { text: 'gato', type: 'animal', meaning: 'Felino doméstico que ronrona e gosta de caçar ratos' },
    { text: 'casa', type: 'lugar', meaning: 'Lugar de abrigo e moradia onde vive a família' },
    { text: 'amor', type: 'sentimento', meaning: 'Sentimento profundo de carinho, afeto e união' },
    { text: 'bola', type: 'objeto', meaning: 'Objeto redondo usado em esportes como futebol e basquete' },
    { text: 'fogo', type: 'elemento', meaning: 'Elemento que queima, emite luz e calor intenso' },
    { text: 'vento', type: 'natureza', meaning: 'Ar em movimento que sopra e refresca o ambiente' },
    { text: 'janela', type: 'lugar', meaning: 'Abertura na parede que permite entrada de ar e luz' },
    { text: 'lobo', type: 'animal', meaning: 'Canídeo selvagem que vive em alcateia e uiva para a lua' },
    { text: 'pedra', type: 'natureza', meaning: 'Pedaço rígido e sólido de mineral ou rocha' },
    { text: 'campo', type: 'natureza', meaning: 'Extensão de terra aberta com grama verde e pastos' },
    { text: 'chuva', type: 'natureza', meaning: 'Gotas de água que se condensam e caem das nuvens' },
    { text: 'terra', type: 'natureza', meaning: 'Solo fértil para plantas ou o nosso planeta azul' },
    { text: 'noite', type: 'tempo', meaning: 'Período escuro do dia entre o pôr e o nascer do sol' },
    { text: 'estrela', type: 'cosmos', meaning: 'Ponto brilhante que emite luz própria no céu noturno' },
    { text: 'dragao', type: 'fantasia', meaning: 'Criatura mítica gigante com asas que cospe labaredas' },
    { text: 'raposa', type: 'animal', meaning: 'Mamífero esperto de cauda peluda e pelo avermelhado' },
    { text: 'cidade', type: 'lugar', meaning: 'Área urbana com muitas ruas, prédios e comércios' },
    { text: 'floresta', type: 'natureza', meaning: 'Grande área repleta de árvores altas e animais' },
    { text: 'planeta', type: 'cosmos', meaning: 'Corpo celeste esférico que orbita ao redor do sol' },
    { text: 'espada', type: 'objeto', meaning: 'Arma de lâmina longa de metal usada por cavaleiros' },
    { text: 'cristal', type: 'objeto', meaning: 'Mineral precioso translúcido, puro e brilhante' },
    { text: 'vulcao', type: 'natureza', meaning: 'Montanha com abertura que expele lava incandescente' },
    { text: 'oceano', type: 'natureza', meaning: 'Imensa extensão de água salgada que cobre o globo' },
    { text: 'serpente', type: 'animal', meaning: 'Réptil rastejante de corpo comprido e sem patas' },
    { text: 'trovao', type: 'natureza', meaning: 'Som estrondoso gerado pela descarga elétrica de um raio' },
    { text: 'farol', type: 'lugar', meaning: 'Torre luminosa que guia embarcações na costa do mar' },
    { text: 'cavalo', type: 'animal', meaning: 'Animal veloz com crina elegante, usado para montaria' },
    { text: 'nuvem', type: 'natureza', meaning: 'Massa branca de vapor de água suspensa no céu' },
    { text: 'leao', type: 'animal', meaning: 'Grande felino carnívoro conhecido como o rei da selva' },
    { text: 'lagoa', type: 'natureza', meaning: 'Corpo de água doce cercado por terra menor que um lago' }
  ],
  fr: [
    { text: 'chat', type: 'animal', meaning: 'Félin domestique joueur au pelage doux qui ronronne' },
    { text: 'maison', type: 'lieu', meaning: 'Bâtiment servant de logement et d\'abri pour la famille' },
    { text: 'amour', type: 'sentiment', meaning: 'Sentiment profond d\'affection, de tendresse et d\'union' },
    { text: 'ballon', type: 'objet', meaning: 'Objet sphérique utilisé dans les jeux sportifs' },
    { text: 'feu', type: 'element', meaning: 'Élément ardent qui brûle et produit lumière et chaleur' },
    { text: 'vent', type: 'nature', meaning: 'Déplacement naturel de l\'air qui souffle dans le ciel' },
    { text: 'fenetre', type: 'lieu', meaning: 'Ouverture dans un mur permettant le passage de la lumière' },
    { text: 'loup', type: 'animal', meaning: 'Canidé sauvage vivant en meute qui hurle à la lune' },
    { text: 'pierre', type: 'nature', meaning: 'Matière minérale dure et solide formant les roches' },
    { text: 'champ', type: 'nature', meaning: 'Vaste étendue de terre cultivée ou couverte d\'herbe' },
    { text: 'pluie', type: 'nature', meaning: 'Précipitation d\'eau liquide tombant des nuages' },
    { text: 'terre', type: 'nature', meaning: 'Sol fertile ou notre belle planète bleue' },
    { text: 'nuit', type: 'temps', meaning: 'Période d\'obscurité entre le coucher et le lever du soleil' },
    { text: 'etoile', type: 'cosmos', meaning: 'Point lumineux brillant dans le ciel nocturne' },
    { text: 'dragon', type: 'fantaisie', meaning: 'Créature mythique ailée crachant de puissantes flammes' },
    { text: 'renard', type: 'animal', meaning: 'Mammifère rusé au pelage roux et à queue touffue' },
    { text: 'ville', type: 'lieu', meaning: 'Agglomération urbaine comptant rues, commerces et édifices' },
    { text: 'foret', type: 'nature', meaning: 'Vaste étendue boisée peuplée d\'arbres et d\'animaux' },
    { text: 'planete', type: 'cosmos', meaning: 'Corps céleste gravitant en orbite autour d\'une étoile' },
    { text: 'epee', type: 'objet', meaning: 'Arme blanche à longue lame métallique de chevalier' },
    { text: 'cristal', type: 'objet', meaning: 'Minéral précieux limpide, régulier et étincelant' },
    { text: 'volcan', type: 'nature', meaning: 'Montagne émettant des coulées de lave incandescente' },
    { text: 'ocean', type: 'nature', meaning: 'Immense étendue d\'eau salée recouvrant le globe' },
    { text: 'serpent', type: 'animal', meaning: 'Reptile sans pattes au corps allongé et sinueux' },
    { text: 'tonnerre', type: 'nature', meaning: 'Bruit éclatant produit par la foudre dans l\'orage' },
    { text: 'lumiere', type: 'cosmos', meaning: 'Rayonnement visible qui éclaire l\'obscurité' },
    { text: 'cheval', type: 'animal', meaning: 'Noble mammifère rapide à la crinière élégante' },
    { text: 'nuage', type: 'nature', meaning: 'Masse vaporeuse blanche suspendue dans l\'atmosphère' },
    { text: 'lion', type: 'animal', meaning: 'Grand félin majestueux couronné roi des animaux' },
    { text: 'lac', type: 'nature', meaning: 'Étendue paisible d\'eau douce entourée de terres' }
  ],
  de: [
    { text: 'katze', type: 'tier', meaning: 'Sanftes Haustier mit weichem Fell, das gerne schnurrt' },
    { text: 'haus', type: 'ort', meaning: 'Gebäude, das Menschen als behagliches Heim dient' },
    { text: 'liebe', type: 'gefuehl', meaning: 'Tiefes Gefühl der Zuneigung, Fürsorge und Verbundenheit' },
    { text: 'ball', type: 'gegenstand', meaning: 'Runder Spielgegenstand für Sport und Bewegung' },
    { text: 'feuer', type: 'element', meaning: 'Loderndes Element, das Licht und Wärme spendet' },
    { text: 'wind', type: 'natur', meaning: 'Spürbare Luftbewegung, die über das Land weht' },
    { text: 'fenster', type: 'ort', meaning: 'Wandöffnung, die frische Luft und Tageslicht einlässt' },
    { text: 'wolf', type: 'tier', meaning: 'Wildes Rudeltier, das nachts den Mond anheult' },
    { text: 'stein', type: 'natur', meaning: 'Hartes, festes Mineralstück aus der Erde' },
    { text: 'feld', type: 'natur', meaning: 'Offene weite Landschaft mit grünen Wiesen' },
    { text: 'regen', type: 'natur', meaning: 'Wassertropfen, die aus den Wolken herabfallen' },
    { text: 'erde', type: 'natur', meaning: 'Fruchtbarer Boden oder unser blauer Heimatplanet' },
    { text: 'nacht', type: 'zeit', meaning: 'Dunkle Zeitspanne zwischen Sonnenuntergang und Morgen' },
    { text: 'stern', type: 'kosmos', meaning: 'Funkelnder Himmelskörper am nächtlichen Firmament' },
    { text: 'drache', type: 'fantasie', meaning: 'Mythisches geflügeltes Wesen, das Feuer speit' },
    { text: 'fuchs', type: 'tier', meaning: 'Schlauer Waldbewohner mit buschigem rotem Schweif' },
    { text: 'stadt', type: 'ort', meaning: 'Urbane Siedlung mit Straßen, Türmen und Geschäften' },
    { text: 'wald', type: 'natur', meaning: 'Großes Gebiet voller hoher Bäume und Waldtiere' },
    { text: 'planet', type: 'kosmos', meaning: 'Himmelskörper, der um eine leuchtende Sonne kreist' },
    { text: 'schwert', type: 'gegenstand', meaning: 'Edle Klingenwaffe der ritterlichen Krieger' },
    { text: 'kristall', type: 'gegenstand', meaning: 'Kostbares, funkelndes und klares Mineral' },
    { text: 'vulkan', type: 'natur', meaning: 'Berg, aus dem glühende Lava emporsteigt' },
    { text: 'ozean', type: 'natur', meaning: 'Gewaltiges Weltmeer, das den Globus umspannt' },
    { text: 'schlange', type: 'tier', meaning: 'Beinloses kriechendes Reptil voller Eleganz' },
    { text: 'donner', type: 'natur', meaning: 'Mächtiges Grollen am Himmel nach einem Blitz' },
    { text: 'licht', type: 'kosmos', meaning: 'Helle Strahlung, die die Welt sichtbar macht' },
    { text: 'pferd', type: 'tier', meaning: 'Anmutiges Huftier mit flatternder Mähne' },
    { text: 'wolke', type: 'natur', meaning: 'Weiße Wasserdampfmasse, die am Himmel zieht' },
    { text: 'loewe', type: 'tier', meaning: 'König der Tiere mit prächtiger, wilder Mähne' },
    { text: 'see', type: 'natur', meaning: 'Ruhiges Binnengewässer umgeben von Natur' }
  ],
  ja: [
    { text: 'neko', type: 'animal', meaning: '猫：愛らしく喉を鳴らす身軽な生き物' },
    { text: 'ie', type: 'place', meaning: '家：家族が安らぎ暮らすあたたかな場所' },
    { text: 'ai', type: 'feeling', meaning: '愛：深く人を想い慈しむ心' },
    { text: 'tama', type: 'object', meaning: '玉・球：スポーツや遊びで転がす丸いもの' },
    { text: 'hi', type: 'element', meaning: '火：光と熱を放ち燃え盛るエレメント' },
    { text: 'kaze', type: 'nature', meaning: '風：大地を通り抜けて吹き抜ける空気の流れ' },
    { text: 'mado', type: 'place', meaning: '窓：光と澄んだ風を部屋に招き入れる開口部' },
    { text: 'ookami', type: 'animal', meaning: '狼：月に吠える誇り高き群れのハンター' },
    { text: 'ishi', type: 'nature', meaning: '石：大地が育んだ硬く揺るぎない鉱物' },
    { text: 'hatake', type: 'nature', meaning: '畑・野：青々とした草や作物が広がる大地' },
    { text: 'ame', type: 'nature', meaning: '雨：空の雲から降り注ぐ恵みの雫' },
    { text: 'tsuchi', type: 'nature', meaning: '土・地球：生命を育む母なる大地' },
    { text: 'yoru', type: 'time', meaning: '夜：日没から夜明けまでの静寂の時間' },
    { text: 'hoshi', type: 'cosmos', meaning: '星：夜空にきらめく無数の光の点' },
    { text: 'ryu', type: 'fantasy', meaning: '竜：天を駆け炎を放つ伝説の聖獣' },
    { text: 'kitsune', type: 'animal', meaning: '狐：豊かな尾を持つ聡明な森の獣' },
    { text: 'machi', type: 'place', meaning: '街：賑わいと人々の活気があふれる都市' },
    { text: 'mori', type: 'nature', meaning: '森：深い緑と生き物たちが息づく木々の世界' },
    { text: 'hoshi', type: 'cosmos', meaning: '惑星：恒星の周りを静かに公転する天体' },
    { text: 'tsurugi', type: 'object', meaning: '剣：研ぎ澄まされた鋭い白銀の刃' },
    { text: 'suisho', type: 'object', meaning: '水晶：純粋な輝きを宿す透明な結晶' },
    { text: 'kazan', type: 'nature', meaning: '火山：灼熱のマグマを吹き上げる雄大な山' },
    { text: 'umi', type: 'nature', meaning: '海：地球の広がりを包み込む壮大な青' },
    { text: 'hebi', type: 'animal', meaning: '蛇：滑らかに地を這う神秘的な生き物' },
    { text: 'kaminari', type: 'nature', meaning: '雷：光の閃光とともに轟く天の轟音' },
    { text: 'hikari', type: 'cosmos', meaning: '光：世界を照らし闇を払う希望の輝き' },
    { text: 'uma', type: 'animal', meaning: '馬：風のように大地を駆ける優美な駿馬' },
    { text: 'kumo', type: 'nature', meaning: '雲：青空にゆったりと浮かぶ白いかたまり' },
    { text: 'shishi', type: 'animal', meaning: '獅子：百獣の王と称される威風堂々の猛獣' },
    { text: 'mizuumi', type: 'nature', meaning: '湖：山々に囲まれた澄んだ静かな水面' }
  ],
  ko: [
    { text: 'goyang-i', type: 'animal', meaning: '고양이: 부드러운 털과 발걸음을 가진 동물' },
    { text: 'jib', type: 'place', meaning: '집: 가족이 모여 편안히 머무는 보금자리' },
    { text: 'sarang', type: 'feeling', meaning: '사랑: 깊이 아끼고 위하는 따뜻한 마음' },
    { text: 'gong', type: 'object', meaning: '공: 운동과 놀이에 쓰이는 둥근 물건' },
    { text: 'bul', type: 'element', meaning: '불: 열과 빛을 내며 타오르는 자연물' },
    { text: 'baram', type: 'nature', meaning: '바람: 대지를 시원하게 스쳐가는 공기의 흐름' },
    { text: 'changmun', type: 'place', meaning: '창문: 햇살과 신선한 공기가 드나드는 곳' },
    { text: 'neukdae', type: 'animal', meaning: '늑대: 달을 향해 울부짖는 야성의 수호자' },
    { text: 'dol', type: 'nature', meaning: '돌: 단단하고 흔들림 없는 단단한 바위 조각' },
    { text: 'deulpan', type: 'nature', meaning: '들판: 초록빛 풀이 드넓게 펼쳐진 대지' },
    { text: 'bi', type: 'nature', meaning: '비: 구름에서 촉촉하게 대지로 내리는 물방울' },
    { text: 'ttang', type: 'nature', meaning: '땅: 생명을 품고 피워내는 기름진 흙' },
    { text: 'bam', type: 'time', meaning: '밤: 해가 지고 별이 반짝이는 고요한 시간' },
    { text: 'byeol', type: 'cosmos', meaning: '별: 어두운 밤하늘을 수놓는 영롱한 빛' },
    { text: 'yong', type: 'fantasy', meaning: '용: 하늘을 가르며 불을 뿜는 전설의 신수' },
    { text: 'yeou', type: 'animal', meaning: '여우: 붉은 꼬리를 지닌 영리한 동물' },
    { text: 'dosi', type: 'place', meaning: '도시: 건물과 불빛이 빛나는 번화한 공간' },
    { text: 'sup', type: 'nature', meaning: '숲: 맑은 공기와 푸른 나무들이 우거진 곳' },
    { text: 'haengseong', type: 'cosmos', meaning: '행성: 별의 주위를 공전하는 웅장한 천체' },
    { text: 'geom', type: 'object', meaning: '검: 용사의 손에 쥐어진 예리한 칼날' },
    { text: 'sujeong', type: 'object', meaning: '수정: 투명하고 맑게 빛나는 신비로운 광물' },
    { text: 'hwasan', type: 'nature', meaning: '화산: 뜨거운 용암을 분출하는 웅장한 산' },
    { text: 'bada', type: 'nature', meaning: '바다: 끝없이 펼쳐진 푸른 파도의 대양' },
    { text: 'baem', type: 'animal', meaning: '뱀: 소리 없이 대지를 미끄러지는 파충류' },
    { text: 'cheon-dung', type: 'nature', meaning: '천둥: 번개 뒤를 따라 하늘을 울리는 굉음' },
    { text: 'bit', type: 'cosmos', meaning: '빛: 어둠을 밝혀 세상을 비추는 밝은 광채' },
    { text: 'mal', type: 'animal', meaning: '말: 바람처럼 갈기를 휘날리며 질주하는 동물' },
    { text: 'gureum', type: 'nature', meaning: '구름: 파란 하늘 위를 자유롭게 유영하는 수증기' },
    { text: 'saja', type: 'animal', meaning: '사자: 당당한 기상을 지닌 백수의 제왕' },
    { text: 'hosu', type: 'nature', meaning: '호수: 육지에 둘러싸여 맑고 잔잔한 물결' }
  ],
  zh: [
    { text: 'mao', type: 'animal', meaning: '猫：可爱机敏、呼噜撒娇的小动物' },
    { text: 'jia', type: 'place', meaning: '家：充满温暖与守候的安居之所' },
    { text: 'ai', type: 'feeling', meaning: '爱：内心深处真挚的情感与守护' },
    { text: 'qiu', type: 'object', meaning: '球：运动与游戏中旋转的圆形物体' },
    { text: 'huo', type: 'element', meaning: '火：散发炽热光芒与能量的烈焰' },
    { text: 'feng', type: 'nature', meaning: '风：在大地上流转吹拂的清新空气' },
    { text: 'chuang', type: 'place', meaning: '窗：迎纳阳光与和风的明净之口' },
    { text: 'lang', type: 'animal', meaning: '狼：团结勇敢、仰天长啸的旷野生灵' },
    { text: 'shi', type: 'nature', meaning: '石：大自然历经岁月洗礼的坚固磐石' },
    { text: 'ye', type: 'nature', meaning: '野：无边无际、生机勃勃的开阔原野' },
    { text: 'yu', type: 'nature', meaning: '雨：自云端飘落、润泽大地的甘霖' },
    { text: 'di', type: 'nature', meaning: '地：孕育万千生命的深厚大地母亲' },
    { text: 'ye', type: 'time', meaning: '夜：夕阳隐没后星河闪耀的宁静时刻' },
    { text: 'xing', type: 'cosmos', meaning: '星：夜空中永恒闪烁的璀璨天体' },
    { text: 'long', type: 'fantasy', meaning: '龙：翱翔九天、吐纳烈焰的祥瑞神兽' },
    { text: 'hu', type: 'animal', meaning: '狐：身姿灵巧、毛色鲜艳的林间生灵' },
    { text: 'cheng', type: 'place', meaning: '城：车水马龙、繁荣喧嚣的现代都市' },
    { text: 'lin', type: 'nature', meaning: '林：古木参天、鸟鸣清脆的苍翠森林' },
    { text: 'xing', type: 'cosmos', meaning: '行星：沿着轨道静谧运行的广袤天体' },
    { text: 'jian', type: 'object', meaning: '剑：寒光闪闪、斩除邪祟的正义之刃' },
    { text: 'jing', type: 'object', meaning: '晶：纯洁通透、折射彩芒的天然矿石' },
    { text: 'shan', type: 'nature', meaning: '火山：涌动灼热岩浆与壮丽熔岩的高山' },
    { text: 'hai', type: 'nature', meaning: '海：浩瀚无垠、波澜壮阔的蓝色大洋' },
    { text: 'she', type: 'animal', meaning: '蛇：蜿蜒滑行、神秘莫测的灵巧爬虫' },
    { text: 'lei', type: 'nature', meaning: '雷：闪电划破长空后的震撼轰鸣' },
    { text: 'guang', type: 'cosmos', meaning: '光：驱散所有黑暗的明亮之源' },
    { text: 'ma', type: 'animal', meaning: '马：昂首嘶鸣、驰骋千里的骏马' },
    { text: 'yun', type: 'nature', meaning: '云：随风漂浮于苍穹之上的洁白水气' },
    { text: 'shi', type: 'animal', meaning: '狮：威武雄壮、傲视草原的百兽之王' },
    { text: 'hu', type: 'nature', meaning: '湖：群山环抱间澄澈如镜的水域' }
  ]
};

// Initial setup from active language
const initLang = (typeof getLanguage === 'function') ? getLanguage() : 'en';
let WORD_POOL = WORD_POOLS[initLang] || WORD_POOLS.en;
let ALL_SYLLABLES = SYLLABLE_POOLS[initLang] || SYLLABLE_POOLS.en;

function updateWordPoolLanguage(lang) {
  WORD_POOL = WORD_POOLS[lang] || WORD_POOLS.en;
  ALL_SYLLABLES = SYLLABLE_POOLS[lang] || SYLLABLE_POOLS.en;
}

// ================================================
// BOSS SYSTEM: SCENARIOS, UNIQUE TYPES & THEMATIC ENIGMAS
// ================================================
// Exactly 1 boss per unique type, each tied to an authentic scenario:
// Phase 10: robot     -> Cybernetic Metropolis (Technological meanings)
// Phase 20: beast     -> Primordial Savanna (Fauna, Predators & Pack meanings)
// Phase 30: mythology -> Mystic Pantheon & Delphi (Mythology & Legendary beings)
// Phase 40: ocean     -> Pelagic Trench & Deep Abyss (Marine biology & Ocean depths)
// Phase 50: cosmos    -> Stellar Nebula & Cosmic Void (Astrophysics, Stars & Gravity)
// Phase 60: volcano   -> Volcanic Caldera & Igneous Core (Magma, Lava & Geology)

const BOSS_DEFS = [
  {
    phase: 10,
    id: 'cyber_titan',
    type: 'robot',
    name: 'Cyber-Titan Lexis',
    namePt: 'Cyber-Titã Lexis',
    title: 'Autonomous Cyber Sentinel',
    titlePt: 'Sentinela Cibernético Autônomo',
    scenario: 'Cybernetic Metropolis',
    scenarioPt: 'Metrópole Cibernética',
    scenarioDesc: 'Mega-city of glowing servers, neural processors and automated drone grids.',
    scenarioDescPt: 'Mega-cidade de servidores luminosos, processadores neurais e malhas autônomas.',
    icon: '🤖',
    color: '#06B6D4',
    badgeText: 'ROBOT • TECH',
    badgeTextPt: 'ROBÔ • TECH',
    lives: 3,
    maxLives: 3,
    lore: 'Master of algorithms, computational logic, and digital networks.',
    lorePt: 'Mestre dos algoritmos, lógica computacional e redes de alta frequência.'
  },
  {
    phase: 20,
    id: 'feral_apex',
    type: 'beast',
    name: 'Rex-Primus, the Feral Apex',
    namePt: 'Rex-Primus, o Soberano Feral',
    title: 'Ancient Apex Predator',
    titlePt: 'Predador Ancestral da Savana',
    scenario: 'Primordial Savanna',
    scenarioPt: 'Savana Primordial',
    scenarioDesc: 'Vast wild plains where primal beasts rule through pure instinct and strength.',
    scenarioDescPt: 'Planícies selvagens onde feras ancestrais reinam pela força e instinto.',
    icon: '🦁',
    color: '#F59E0B',
    badgeText: 'FAUNA • BEAST',
    badgeTextPt: 'FAUNA • FERA',
    lives: 3,
    maxLives: 3,
    lore: 'Emperor of wild herds, razor talons, and coordinated pack hunters.',
    lorePt: 'Soberano das manadas selvagens, garras afiadas e alcateias implacáveis.'
  },
  {
    phase: 30,
    id: 'arcane_chimera',
    type: 'mythology',
    name: 'Arcane Chimera of Delphi',
    namePt: 'Quimera Arcana de Delfos',
    title: 'Guardian of the Sacred Pantheon',
    titlePt: 'Guardião do Panteão Sagrado',
    scenario: 'Mystic Olympus Temple',
    scenarioPt: 'Templo Místico de Delfos',
    scenarioDesc: 'Ancient sanctuary of high columns, sacred oracles, and mythical creatures.',
    scenarioDescPt: 'Santuário de colunas monumentais, oráculos sagrados e criaturas lendárias.',
    icon: '🐲',
    color: '#A855F7',
    badgeText: 'MYTHOLOGY • LEGEND',
    badgeTextPt: 'MITOLOGIA • LENDA',
    lives: 3,
    maxLives: 3,
    lore: 'Forged from mythological fire, riddling sphinxes, and hydra heads.',
    lorePt: 'Forjado no fogo mitológico, enigmas de esfinge e lendas dos deuses antigos.'
  },
  {
    phase: 40,
    id: 'abyssal_leviathan',
    type: 'ocean',
    name: 'Deep Abyss Leviathan',
    namePt: 'Leviatã do Abismo Profundo',
    title: 'Monarch of the Pelagic Trenches',
    titlePt: 'Monarca das Trincheiras Abissais',
    scenario: 'Pelagic Ocean Trench',
    scenarioPt: 'Fossa Oceânica Abissal',
    scenarioDesc: 'Crushing deep sea where bioluminescent organisms glide in absolute darkness.',
    scenarioDescPt: 'Profundezas oceânicas onde seres bioluminescentes reinam na escuridão total.',
    icon: '🐙',
    color: '#0EA5E9',
    badgeText: 'OCEAN • ABYSS',
    badgeTextPt: 'OCEANO • ABISMO',
    lives: 3,
    maxLives: 3,
    lore: 'Commander of tidal waves, colossal sharks, and deep-sea trenches.',
    lorePt: 'Comandante das marés, tsunamis, recifes de corais e fossas submarinas.'
  },
  {
    phase: 50,
    id: 'cosmic_chronos',
    type: 'cosmos',
    name: 'Astro-Titan Chronos',
    namePt: 'Astro-Titã Cronos',
    title: 'Weaver of Galaxies & Nebulae',
    titlePt: 'Tecedor das Galáxias e Nebulosas',
    scenario: 'Stellar Nebula & Cosmic Void',
    scenarioPt: 'Nebulosa Estelar & Vácuo Cósmico',
    scenarioDesc: 'Infinite cosmic void swirling with ionized star clouds and gravitational orbits.',
    scenarioDescPt: 'Vácuo estelar infinito com nuvens de plasma ionizado e órbitas gravitacionais.',
    icon: '🌌',
    color: '#6366F1',
    badgeText: 'COSMOS • SPACE',
    badgeTextPt: 'COSMOS • ESPAÇO',
    lives: 3,
    maxLives: 3,
    lore: 'Ruler of thermonuclear star cores, pulsar beacons, and cosmic gravitational pulls.',
    lorePt: 'Regente da fusão estelar, pulsares rítmicos e gravidade orbital.'
  },
  {
    phase: 60,
    id: 'magma_vulcanus',
    type: 'volcano',
    name: 'Vulcanus, the Magma Colossus',
    namePt: 'Vulcanus, o Colosso de Magma',
    title: 'Lord of the Tectonic Caldera',
    titlePt: 'Senhor da Caldeira Tectônica',
    scenario: 'Volcanic Caldera & Igneous Core',
    scenarioPt: 'Caldeira Vulcânica & Núcleo Ígneo',
    scenarioDesc: 'Incandescent sea of subterranean lava, basalt pillars, and smoking craters.',
    scenarioDescPt: 'Mar subterrâneo de lava incandescente, colunas de basalto e crateras fumegantes.',
    icon: '🌋',
    color: '#EF4444',
    badgeText: 'VOLCANO • MAGMA',
    badgeTextPt: 'VULCÃO • MAGMA',
    lives: 3,
    maxLives: 3,
    lore: 'Incarnation of tectonic eruption, pyroclastic surges, and liquid rock.',
    lorePt: 'Encarnação das erupções tectônicas, nuvens piroclásticas e rochas fundidas.'
  }
];

function getBossForPhase(phase) {
  const p = parseInt(phase, 10) || 10;
  const match = BOSS_DEFS.find(b => b.phase === p);
  if (match) {
    return { ...match, lives: 3, maxLives: 3 };
  }
  const level = Math.max(1, Math.floor(p / 10));
  const base = BOSS_DEFS[(level - 1) % BOSS_DEFS.length];
  return {
    ...base,
    name: `${base.name} (Lv. ${level})`,
    namePt: `${base.namePt || base.name} (Nv. ${level})`,
    lives: 3,
    maxLives: 3
  };
}

// ================================================
// THEMATIC VOCABULARY & ENIGMA MEANINGS BY BOSS TYPE
// ================================================
const BOSS_WORDS_BY_TYPE = {
  // 1. ROBOT: Technological & Cybernetic Meanings
  robot: {
    pt: [
      { text: 'chip', type: 'tech', meaning: 'Circuito integrado de silício que processa instruções computacionais em microssegundos' },
      { text: 'laser', type: 'tech', meaning: 'Feixe de luz concentrada e coerente utilizado em leituras ópticas, scanners e cortes' },
      { text: 'rede', type: 'tech', meaning: 'Malha de conexões digitais e servidores que interliga computadores e sistemas globais' },
      { text: 'dados', type: 'tech', meaning: 'Informações digitais estruturadas processadas por algoritmos e bancos computacionais' },
      { text: 'pixel', type: 'tech', meaning: 'Menor unidade individual de cor que compõe uma imagem digital na matriz da tela' },
      { text: 'robo', type: 'tech', meaning: 'Máquina eletromecânica autônoma e programável projetada para executar tarefas complexas' },
      { text: 'circuito', type: 'tech', meaning: 'Caminho condutor fechado por onde flui a corrente elétrica em placas-mãe' },
      { text: 'satelite', type: 'tech', meaning: 'Dispositivo orbital espacial que retransmite dados e sinais de comunicação para o globo' },
      { text: 'codigo', type: 'tech', meaning: 'Conjunto de regras e instruções binárias escritas em uma linguagem de programação' }
    ],
    en: [
      { text: 'chip', type: 'tech', meaning: 'Silicon integrated circuit that executes logic instructions at gigahertz frequencies' },
      { text: 'laser', type: 'tech', meaning: 'Coherent amplified beam of light used in precision optical scanning and data reading' },
      { text: 'network', type: 'tech', meaning: 'Interconnected digital grid of high-speed servers exchanging packets worldwide' },
      { text: 'data', type: 'tech', meaning: 'Binary units of information processed and analyzed by algorithmic systems' },
      { text: 'pixel', type: 'tech', meaning: 'Smallest addressable color element on a high-definition visual display screen' },
      { text: 'robot', type: 'tech', meaning: 'Autonomous electro-mechanical automaton programmed to execute complex cyber operations' },
      { text: 'circuit', type: 'tech', meaning: 'Closed conductive loop through which electrical current and binary pulses flow' },
      { text: 'satellite', type: 'tech', meaning: 'Orbital spacecraft transmitting global positioning telemetry and encrypted telemetry' },
      { text: 'code', type: 'tech', meaning: 'Structured sequence of algorithmic syntax commanding computer processors' }
    ],
    fr: [
      { text: 'puce', type: 'tech', meaning: 'Circuit intégré de silicium qui exécute les calculs et instructions informatiques' },
      { text: 'laser', type: 'tech', meaning: 'Faisceau de lumière cohérente et concentrée servant au balayage et à l\'optique' },
      { text: 'reseau', type: 'tech', meaning: 'Ensemble de serveurs interconnectés échangeant des données numériques à haute vitesse' },
      { text: 'donnees', type: 'tech', meaning: 'Unités d\'information binaire analysées et traitées par les algorithmes' },
      { text: 'pixel', type: 'tech', meaning: 'Plus petit élément de couleur composant une image numérique sur un écran' },
      { text: 'robot', type: 'tech', meaning: 'Machine autonome et programmable conçue pour exécuter des tâches mécaniques' },
      { text: 'circuit', type: 'tech', meaning: 'Boucle conductrice fermée dans laquelle circule le courant électrique' },
      { text: 'code', type: 'tech', meaning: 'Instructions structurées écrites dans un langage de programmation' }
    ],
    de: [
      { text: 'chip', type: 'tech', meaning: 'Integrierter Halbleiterschaltkreis, der Prozessoroperationen im Nanosekundenbereich ausführt' },
      { text: 'laser', type: 'tech', meaning: 'Gebündelter kohärenter Lichtstrahl für präzise optische Abtastung und Datenübertragung' },
      { text: 'netz', type: 'tech', meaning: 'Verbundene digitale Serverarchitektur zum weltweiten Austausch von Datenpaketen' },
      { text: 'daten', type: 'tech', meaning: 'Binäre Informationseinheiten, die von Algorithmen verarbeitet und gespeichert werden' },
      { text: 'pixel', type: 'tech', meaning: 'Kleinstes adressierbares Farbpixel auf einer digitalen Bildschirmanzeige' },
      { text: 'roboter', type: 'tech', meaning: 'Autonome programmierbare Maschine zur fehlerfreien Ausführung technischer Befehle' },
      { text: 'code', type: 'tech', meaning: 'Strukturierte logische Anweisungen in einer definierten Programmiersprache' }
    ],
    ja: [
      { text: 'kaero', type: 'tech', meaning: '回路：電子やバイナリ信号が流れる高密度のプリント基板' },
      { text: 'kodo', type: 'tech', meaning: 'コード：プロセッサを駆動するプログラム命令の構文' },
      { text: 'deta', type: 'tech', meaning: 'データ：アルゴリズムによって高速処理されるバイナリ情報' },
      { text: 'kikai', type: 'tech', meaning: '機械：正確な演算と自律動作を実行するサイバー構造体' },
      { text: 'hikari', type: 'tech', meaning: 'レーザー光：光学的スキャンや通信を行う強力な指向性ビーム' },
      { text: 'kensa', type: 'tech', meaning: 'スキャン：システムの不具合や侵入者を検出する監視シーケンス' },
      { text: 'denki', type: 'tech', meaning: '電力：超小型チップを起動させるエネルギーの流れ' }
    ],
    ko: [
      { text: 'kodeu', type: 'tech', meaning: '코드: 시스템 프로세서를 구동하는 정밀한 프로그래밍 명령어' },
      { text: 'deta', type: 'tech', meaning: '데이터: 초고속 알고리즘으로 처리되는 바이너리 디지털 정보' },
      { text: 'lobo', type: 'tech', meaning: '로봇: 복잡한 연산과 물리적 작업을 자율 수행하는 기계 구조물' },
      { text: 'biseu', type: 'tech', meaning: '칩셋: 수억 개의 트랜지스터가 집약된 초소형 논리 회로' },
      { text: 'hwalo', type: 'tech', meaning: '회로: 전류가 순환하며 신호를 전달하는 마더보드의 통로' },
      { text: 'jeongi', type: 'tech', meaning: '전기: 메가로봇의 에너지 코어를 활성화하는 동력원' }
    ],
    zh: [
      { text: 'xinpi', type: 'tech', meaning: '芯片：以纳米级晶体管高速执行二进制指令的集成电路' },
      { text: 'jiguang', type: 'tech', meaning: '激光：用于光学传感、高能扫描与数据传输的高相干性光束' },
      { text: 'wangluo', type: 'tech', meaning: '网络：将海量计算节点与数据中心连接的互联数字网格' },
      { text: 'shuju', type: 'tech', meaning: '数据：由算法系统高速解析和存取的离散信息单元' },
      { text: 'jiqiren', type: 'tech', meaning: '机器人：具备传感器与执行机构的自律型机电智能设备' },
      { text: 'daima', type: 'tech', meaning: '代码：使用编程语言规范书写给计算机执行的程序序列' }
    ]
  },

  // 2. BEAST: Fauna, Apex Predators & Savanna Wilds
  beast: {
    pt: [
      { text: 'leao', type: 'fauna', meaning: 'Predador carnívoro ápice da savana, munido de juba volumosa e força esmagadora' },
      { text: 'lobo', type: 'fauna', meaning: 'Canídeo selvagem feroz que caça em alcateia e se comunica por uivos melódicos' },
      { text: 'tigre', type: 'fauna', meaning: 'Maior felino do planeta, com camuflagem de listras pretas e bote fulminante' },
      { text: 'aguia', type: 'fauna', meaning: 'Ave de rapina de visão telescópica aguçada que mergulha dos céus com garras letais' },
      { text: 'alcateia', type: 'fauna', meaning: 'Sociedade cooperativa e hierárquica de predadores caninos unidos para a caçada' },
      { text: 'garras', type: 'fauna', meaning: 'Unhas curvas retráteis de queratina afiadas para golpear e imobilizar a caça' },
      { text: 'presa', type: 'fauna', meaning: 'Animal perseguido no equilíbrio da cadeia alimentar que depende da agilidade para fugir' },
      { text: 'fauna', type: 'fauna', meaning: 'Conjunto biológico de todas as criaturas animais selvagens de um ecossistema natural' },
      { text: 'savana', type: 'fauna', meaning: 'Bioma de planícies douradas e acácias onde manadas e grandes carnívoros coexistem' }
    ],
    en: [
      { text: 'lion', type: 'fauna', meaning: 'Apex predatory cat with a majestic mane reigning over the golden savanna territory' },
      { text: 'wolf', type: 'fauna', meaning: 'Ferocious wild canine coordinating pack tactics across vast wilderness and howling' },
      { text: 'tiger', type: 'fauna', meaning: 'Largest solitary wild cat possessing lethal strength and iconic vertical camouflaging stripes' },
      { text: 'eagle', type: 'fauna', meaning: 'High-altitude raptor soaring with telescopic vision and talons that strike with precision' },
      { text: 'pack', type: 'fauna', meaning: 'Organized hunting pride cooperating with disciplined predatory instinct' },
      { text: 'claws', type: 'fauna', meaning: 'Curved razor-sharp keratin weapons deployed by ferocious carnivores to seize targets' },
      { text: 'prey', type: 'fauna', meaning: 'Herbivores and quarry pursued in the primordial circle of the wild food chain' },
      { text: 'fauna', type: 'fauna', meaning: 'The collective animal kingdom inhabiting a wild natural biome' },
      { text: 'savanna', type: 'fauna', meaning: 'Sun-drenched tropical grassland ecosystem teeming with roaming herds and predators' }
    ],
    fr: [
      { text: 'lion', type: 'fauna', meaning: 'Grand félin majestueux couronné souverain des étendues dorées de la savane' },
      { text: 'loup', type: 'fauna', meaning: 'Canidé sauvage vivant en meute solidaire qui communique par de puissants hurlements' },
      { text: 'tigre', type: 'fauna', meaning: 'Félin rayé solitaire doté d\'une musculature puissante et d\'une discrétion absolue' },
      { text: 'aigle', type: 'fauna', meaning: 'Rapace royal des cimes doté de serres acérées et d\'un regard perçant' },
      { text: 'meute', type: 'fauna', meaning: 'Groupe organisé de prédateurs sauvages chassant en parfaite coordination' },
      { text: 'griffes', type: 'fauna', meaning: 'Armes courbes acérées en kératine équipant les pattes des redoutables fauves' },
      { text: 'proie', type: 'fauna', meaning: 'Animal traqué par les carnivores dans le cycle ancestral de la nature' },
      { text: 'faune', type: 'fauna', meaning: 'Ensemble de la vie animale peuplant un biome sauvage et préservé' },
      { text: 'savane', type: 'fauna', meaning: 'Vaste plaine herbeuse abritant les plus spectaculaires migrations animales' }
    ],
    de: [
      { text: 'loewe', type: 'fauna', meaning: 'Majestätischer Spitzenprädator mit dichter Mähne, der die afrikanische Savanne beherrscht' },
      { text: 'wolf', type: 'fauna', meaning: 'Wildes Rudeltier mit ausgeprägtem Jagdinstinkt, das nachts den Mond anheult' },
      { text: 'tiger', type: 'fauna', meaning: 'Größte gestreifte Raubkatze der Erde mit immenser Sprungkraft und Tarnung' },
      { text: 'adler', type: 'fauna', meaning: 'König der Lüfte mit messerscharfen Fängen und hochentwickeltem Sehvermögen' },
      { text: 'rudel', type: 'fauna', meaning: 'Disziplinierte Jagdgemeinschaft von Beutegreifern in der Wildnis' },
      { text: 'krallen', type: 'fauna', meaning: 'Scharf gekrümmte Hornwaffen der Raubtiere zum Schlagen der Beute' },
      { text: 'beute', type: 'fauna', meaning: 'Gejagtes Tier im ewigen Kreislauf der unberührten Nahrungskette' },
      { text: 'fauna', type: 'fauna', meaning: 'Die gesamte artenreiche Tierwelt eines natürlichen Lebensraumes' }
    ],
    ja: [
      { text: 'shishi', type: 'fauna', meaning: '百獣の王：堂々たるたてがみと圧倒的な狩りの力を持つ大型肉食獣' },
      { text: 'ookami', type: 'fauna', meaning: '狼：群れを統率して荒野を駆け、月に遠吠えを響かせる狩人' },
      { text: 'tora', type: 'fauna', meaning: '虎：強靭な筋肉と見事な縞模様を持つ孤独な森の猛獣' },
      { text: 'washi', type: 'fauna', meaning: '鷲：上空から獲物を見失わず鋭い爪で急降下する空の覇者' },
      { text: 'mure', type: 'fauna', meaning: '群れ：厳格な序列を守り連携して獲物を追いつめる捕食者集団' },
      { text: 'tsume', type: 'fauna', meaning: '鉤爪：獲物を確実に捕獲し引き裂く鋭利な天然の武器' },
      { text: 'emono', type: 'fauna', meaning: '獲物：自然界の食物連鎖の中で命を賭して逃走する野生動物' },
      { text: 'kemono', type: 'fauna', meaning: '獣：過酷な大自然を本能と生命力で生き抜く強き生き物' }
    ],
    ko: [
      { text: 'saja', type: 'fauna', meaning: '사자: 광활한 사바나를 호령하는 갈기와 위엄을 지닌 최상위 포식자' },
      { text: 'neukdae', type: 'fauna', meaning: '늑대: 무리를 지어 협력 사냥을 펼치며 달을 향해 울부짖는 맹수' },
      { text: 'horangi', type: 'fauna', meaning: '호랑이: 은밀한 줄무늬와 폭발적인 근력을 지닌 고독한 정글의 제왕' },
      { text: 'doksuri', type: 'fauna', meaning: '독수리: 천 미터 상공에서도 표적을 포착하는 날카로운 발톱의 맹금류' },
      { text: 'baltob', type: 'fauna', meaning: '발톱: 포식자가 먹이를 단숨에 제압하기 위해 갈고 닦은 흉기' },
      { text: 'meok-i', type: 'fauna', meaning: '먹잇감: 원초적 야생의 먹이사슬 속에서 생존을 위해 질주하는 동물' },
      { text: 'yasoo', type: 'fauna', meaning: '야수: 길들여지지 않은 야생의 본능과 생명력을 간직한 짐승' }
    ],
    zh: [
      { text: 'shizi', type: 'fauna', meaning: '狮子：拥有威严鬃毛、统治开阔草原与领地的顶级食肉王者' },
      { text: 'lang', type: 'fauna', meaning: '狼：以严密纪律协同狩猎、向着夜月发出悠长长嚎的荒野捕食者' },
      { text: 'laohu', type: 'fauna', meaning: '老虎：身披斑斓条纹、具备极强爆发力和隐蔽伏击能力的丛林霸主' },
      { text: 'laoying', type: 'fauna', meaning: '老鹰：翱翔于九天之上、以极目远眺锁定制胜猎物的猛禽' },
      { text: 'lizhao', type: 'fauna', meaning: '利爪：猛兽脚掌上用于奔袭撕裂与扑杀猎物的尖锐角质武器' },
      { text: 'liewu', type: 'fauna', meaning: '猎物：在大自然残酷食物链中依靠敏捷机敏求生的动物' },
      { text: 'yeshou', type: 'fauna', meaning: '野兽：以原始生存本能主宰旷野山川的强悍陆地生命' }
    ]
  },

  // 3. MYTHOLOGY: Gods, Mythical Beasts & Ancient Legends
  mythology: {
    pt: [
      { text: 'dragao', type: 'myth', meaning: 'Criatura colossal alada que cospe labaredas arcanas e protege segredos ancestrais' },
      { text: 'fenix', type: 'myth', meaning: 'Pássaro mitológico solar imortal que renasce glorioso das próprias cinzas' },
      { text: 'hidra', type: 'myth', meaning: 'Monstro serpentino mitológico que faz brotar duas novas cabeças a cada golpe sofrido' },
      { text: 'grifo', type: 'myth', meaning: 'Fera com corpo majestoso de leão e cabeça e asas douradas de águia dos céus' },
      { text: 'olimpo', type: 'myth', meaning: 'Montanha sagrada nas nuvens onde os deuses supremos da antiguidade governavam' },
      { text: 'esfinge', type: 'myth', meaning: 'Guardiã alada com corpo de leoa que propõe enigmas mortais aos viajantes' },
      { text: 'oraculo', type: 'myth', meaning: 'Santuário profético sagrado onde divindades revelavam o destino dos homens' },
      { text: 'quimera', type: 'myth', meaning: 'Besta quimérica que cospe fogo formada por partes de leão, cabra e serpente' },
      { text: 'tita', type: 'myth', meaning: 'Divindade primordial de poder astronômico que moldou as forças originais do cosmos' }
    ],
    en: [
      { text: 'dragon', type: 'myth', meaning: 'Colossal winged mythical reptile breathing incinerating arcane torrents of flame' },
      { text: 'phoenix', type: 'myth', meaning: 'Radiant legendary solar firebird reincarnating immortal from sacred ashes' },
      { text: 'hydra', type: 'myth', meaning: 'Mythological multi-headed serpent that regenerates two heads for each one severed' },
      { text: 'griffin', type: 'myth', meaning: 'Mythic hybrid possessing the muscular body of a lion and eagle wings and head' },
      { text: 'olympus', type: 'myth', meaning: 'Mountaintop sanctum shrouded in clouds where supreme ancient deities gathered' },
      { text: 'sphinx', type: 'myth', meaning: 'Winged riddling guardian with a lion body slaying those who fail the trial' },
      { text: 'oracle', type: 'myth', meaning: 'Sacred prophetic shrine through which the gods whispered unavoidable destinies' },
      { text: 'chimera', type: 'myth', meaning: 'Fire-breathing chimeric monster fusing the dread parts of lion, goat, and serpent' },
      { text: 'titan', type: 'myth', meaning: 'Primordial cosmic giant wielding earth-shaking strength before the olympian age' }
    ],
    fr: [
      { text: 'dragon', type: 'myth', meaning: 'Créature ailée colossale crachant des torrents de feu et gardant des trésors magiques' },
      { text: 'phenix', type: 'myth', meaning: 'Oiseau fabuleux immortel qui se consume pour renaître de ses cendres incandescentes' },
      { text: 'hydre', type: 'myth', meaning: 'Monstre aquatique à têtes multiples qui repoussent en double à chaque blessure' },
      { text: 'griffon', type: 'myth', meaning: 'Créature fabuleuse combinant la force du lion et la vélocité majestueuse de l\'aigle' },
      { text: 'olympe', type: 'myth', meaning: 'Demeure céleste et sacrée des dieux grecs perchée au-delà des nuages' },
      { text: 'sphinx', type: 'myth', meaning: 'Bête énigmatique au corps de félin ailé dévorant quiconque échoue à son mystère' },
      { text: 'oracle', type: 'myth', meaning: 'Sanctuaire divinatoire où la volonté des dieux était transmise aux héros' },
      { text: 'chimere', type: 'myth', meaning: 'Monstre mythologique hybride crachant des flammes composé de lion, chèvre et serpent' },
      { text: 'titan', type: 'myth', meaning: 'Divinité gigantesque de l\'âge d\'or personnifiant les forces primordiales' }
    ],
    de: [
      { text: 'drache', type: 'myth', meaning: 'Gewaltiges geflügeltes Fabelwesen, das verzehrende Flammen speit und Burgen bewacht' },
      { text: 'phaenix', type: 'myth', meaning: 'Mythischer Feuervogel der Wiedergeburt, der stets verjüngt aus seiner Asche aufsteigt' },
      { text: 'hydra', type: 'myth', meaning: 'Vielköpfiges Ungeheuer, dem bei jedem Schwerthieb zwei neue Köpfe nachwachsen' },
      { text: 'greif', type: 'myth', meaning: 'Mächtiges Mischwesen aus Raubkatze und Adler, Sinnbild für Stärke und Wachsamkeit' },
      { text: 'olymp', type: 'myth', meaning: 'Heiliger Göttersitz in lichten Höhen, von wo aus Zeus das Schicksal lenkte' },
      { text: 'sphinx', type: 'myth', meaning: 'Geflügelte Hüterin der Geheimnisse, die unlösbare Schicksalsrätsel stellt' },
      { text: 'orakel', type: 'myth', meaning: 'Heilige Seherstätte, an der Priesterinnen den Willen der Götter verkündeten' },
      { text: 'titan', type: 'myth', meaning: 'Urgöttliches Riesengeschlecht mit gewaltigen Urkräften der Schöpfung' }
    ],
    ja: [
      { text: 'ryu', type: 'myth', meaning: '竜・龍：天を駆け灼熱の炎や雷を操る神聖にして強大な伝説の獣' },
      { text: 'fushichou', type: 'myth', meaning: '不死鳥：自らを炎で焼き、その灰の中から永遠に蘇る霊鳥' },
      { text: 'shinwa', type: 'myth', meaning: '神話：神々と英雄たちが世界の創世と運命を紡いだ古代の物語' },
      { text: 'kamigami', type: 'myth', meaning: '神々：天界の神殿に集い、人々の祈りと運命を司る至高の存在' },
      { text: 'orinpusu', type: 'myth', meaning: 'オリュンポス：雲海の上にそびえ立つ神々の聖なる都' },
      { text: 'oraku', type: 'myth', meaning: '神託：巫女を通じて下される、決して逆らえぬ運命の啓示' },
      { text: 'kyojin', type: 'myth', meaning: '巨人・ティタン：オリュンポスの神々に先立ち天地を支えた原初の神族' }
    ],
    ko: [
      { text: 'yong', type: 'myth', meaning: '용: 거대한 날개와 입에서 토해내는 마법의 불길로 세상을 압도하는 신화 속 생물' },
      { text: 'bulsae', type: 'myth', meaning: '불사조: 제 몸을 불태운 뒤 찬란한 잿더미 속에서 영원히 부활하는 전설의 영조' },
      { text: 'sinwha', type: 'myth', meaning: '신화: 신들과 영웅들의 서사가 기록된 인류 태초의 영웅적 전설' },
      { text: 'sin', type: 'myth', meaning: '신: 하늘 위의 신전에 머물며 자연과 번개를 다스리는 불멸의 존재' },
      { text: 'taetan', type: 'myth', meaning: '티탄: 올림포스 이전 세상의 기틀을 마련했던 거대한 태초의 거인족' },
      { text: 'sinjeon', type: 'myth', meaning: '신전: 신성한 제단과 거대한 석주가 신들의 영광을 증명하는 성소' }
    ],
    zh: [
      { text: 'shenlong', type: 'myth', meaning: '神龙：翱翔于九霄云外、吞吐焚天烈焰与雷霆的天地神兽' },
      { text: 'fenghuang', type: 'myth', meaning: '凤凰：浴火淬炼而生命不灭、在余烬中翱翔重生的百鸟之王' },
      { text: 'shenhua', type: 'myth', meaning: '神话：记载远古神明开辟混沌与英雄传奇的洪荒史诗' },
      { text: 'tianling', type: 'myth', meaning: '天神：居住于神山圣巅、执掌天地风云与宿命的永生神祇' },
      { text: 'juren', type: 'myth', meaning: '泰坦巨人：诞生于天地开辟之初、拥有翻江倒海伟力的上古巨神' },
      { text: 'shengdian', type: 'myth', meaning: '圣殿：供奉神谕与永恒圣火、接受万人朝拜的庄严殿堂' }
    ]
  },

  // 4. OCEAN: Deep Sea, Marine Life, Trenches & Abyssal Currents
  ocean: {
    pt: [
      { text: 'oceano', type: 'ocean', meaning: 'Vasta imensidão de água salgada que cobre a maior parte do planeta e guarda fossas inexploradas' },
      { text: 'tubarao', type: 'ocean', meaning: 'Predador marinho cartilaginoso dotado de sentidos elétricos e mandíbula formidável' },
      { text: 'coral', type: 'ocean', meaning: 'Colônias de pólipos marinhos coloridos que erguem as maiores estruturas vivas da Terra' },
      { text: 'abismo', type: 'ocean', meaning: 'Profundezas pelágicas de escuridão absoluta sob pressão hidrostática esmagadora' },
      { text: 'polvo', type: 'ocean', meaning: 'Mestre cefalópode de oito tentáculos com camuflagem instantânea e inteligência aguda' },
      { text: 'tsunami', type: 'ocean', meaning: 'Parede colossal de água marinha arremessada por abalos sísmicos no fundo do oceano' },
      { text: 'baleia', type: 'ocean', meaning: 'Gigante mamífero aquático que ecoa cantos harmônicos por milhares de milhas marítimas' },
      { text: 'fossa', type: 'ocean', meaning: 'Fenda submarina vertiginosa que mergulha nas trincheiras mais profundas do leito oceânico' },
      { text: 'mare', type: 'ocean', meaning: 'Movimento constante de fluxo e refluxo das águas governado pela atração gravitacional da Lua' }
    ],
    en: [
      { text: 'ocean', type: 'ocean', meaning: 'Vast saltwater expanse blanketing planet Earth and cradling undiscovered depths' },
      { text: 'shark', type: 'ocean', meaning: 'Streamlined cartilaginous hunter tracking prey through acute electroreception' },
      { text: 'coral', type: 'ocean', meaning: 'Colonial marine organisms building vibrant calcified barrier reefs beneath waves' },
      { text: 'abyss', type: 'ocean', meaning: 'Pitch-black ocean zone enduring crushing pressure beyond the reach of sunlight' },
      { text: 'octopus', type: 'ocean', meaning: 'Eight-armed cephalopod genius displaying instant color-shifting chromatophore camouflage' },
      { text: 'tsunami', type: 'ocean', meaning: 'Monstrous oceanic surge unleashed across open waters by seafloor seismic displacement' },
      { text: 'whale', type: 'ocean', meaning: 'Mammoth gentle cetacean transmitting deep acoustic whale songs through ocean basins' },
      { text: 'trench', type: 'ocean', meaning: 'Deepest geological chasm cut into the ocean crust sheltering extremophile life' },
      { text: 'tide', type: 'ocean', meaning: 'Rhythmic rise and retreat of sea surfaces influenced by lunar gravitational pull' }
    ],
    fr: [
      { text: 'ocean', type: 'ocean', meaning: 'Immense étendue d\'eau salée recouvrant la terre et abritant les abysses mystérieux' },
      { text: 'requin', type: 'ocean', meaning: 'Redoutable prédateur marin cartilagineux guidé par un odorat et une ouïe exceptionnels' },
      { text: 'corail', type: 'ocean', meaning: 'Organismes marins bâtisseurs formant de spectaculaires barrières de récifs vivants' },
      { text: 'abysse', type: 'ocean', meaning: 'Fonds marins ténébreux soumis à une pression écrasante où la lumière n\'arrive jamais' },
      { text: 'poulpe', type: 'ocean', meaning: 'Céphalopode intelligent à huit bras capable de changer de couleur et de texture instantanément' },
      { text: 'tsunami', type: 'ocean', meaning: 'Vague déferlante colossale engendrée par un séisme survenant au fond des mers' },
      { text: 'baleine', type: 'ocean', meaning: 'Géant des mers communiquant sur de grandes distances par de mystérieux chants' },
      { text: 'fosse', type: 'ocean', meaning: 'Dépression sous-marine abyssale plongeant dans les tréfonds de la croûte océanique' },
      { text: 'maree', type: 'ocean', meaning: 'Mouvement périodique d\'oscillation des eaux sous l\'effet de la gravité lunaire' }
    ],
    de: [
      { text: 'ozean', type: 'ocean', meaning: 'Gewaltiges Weltmeer voller unerforschter Tiefseegräben und faszinierender Lebensformen' },
      { text: 'hai', type: 'ocean', meaning: 'Perfekt angepasster Meeresjäger mit empfindlichen Sensoren für schwächste elektrische Reize' },
      { text: 'koralle', type: 'ocean', meaning: 'Farbprächtige Koloniebildner, die monumentale lebende Riffe im warmen Wasser schaffen' },
      { text: 'abgrund', type: 'ocean', meaning: 'Lichtlose Tiefseeebene unter gigantischem hydrostatischem Wasserdruck' },
      { text: 'krake', type: 'ocean', meaning: 'Hochintelligenter Tintenfisch mit acht Fangarmen und meisterhafter Tarnkunst' },
      { text: 'tsunami', type: 'ocean', meaning: 'Zerstörerische Flutwelle, die durch ein Unterwasserbeben im Ozeanboden erzeugt wird' },
      { text: 'wal', type: 'ocean', meaning: 'Größtes Säugetier des Planeten, das majestätisch durch die Ozeane zieht' },
      { text: 'flut', type: 'ocean', meaning: 'Ansteigender Wasserstand an Küsten im Rhythmus der Gezeiten' }
    ],
    ja: [
      { text: 'kaiyou', type: 'ocean', meaning: '海洋：地球の大部分を包み込み、未知の深海を抱く広大なる塩水の海' },
      { text: 'same', type: 'ocean', meaning: '鮫：微弱な生体電気を感じ取り獲物を追う流線型の捕食者' },
      { text: 'sango', type: 'ocean', meaning: '珊瑚：海底に色鮮やかな巨大礁を築き上げる海洋生態系の揺りかご' },
      { text: 'shinkai', type: 'ocean', meaning: '深海：太陽の光が届かず、超高圧と暗黒が支配する神秘の世界' },
      { text: 'tako', type: 'ocean', meaning: '蛸：八本の腕と高度な知性を持ち、瞬時に体色を変える軟体動物' },
      { text: 'kujira', type: 'ocean', meaning: '鯨：深海に響く歌声で仲間と交信する地球上最大の海洋哺乳類' },
      { text: 'shio', type: 'ocean', meaning: '潮汐：月の引力によって規則正しく満ち引きを繰り返す海水の潮流' },
      { text: 'kaikou', type: 'ocean', meaning: '海溝：プレートが沈み込み地球で最も深い谷を形成する暗黒の裂け目' }
    ],
    ko: [
      { text: 'bada', type: 'ocean', meaning: '바다: 지구 표면을 뒤덮고 있는 거대하고 신비로운 푸른 소금물의 세계' },
      { text: 'sangeo', type: 'ocean', meaning: '상어: 날카로운 이빨과 뛰어난 전기 감각으로 바다를 지배하는 사냥꾼' },
      { text: 'sanho', type: 'ocean', meaning: '산호: 바닷속에 아름다운 암초를 형성하여 수많은 해양 생물을 품는 군체' },
      { text: 'simhae', type: 'ocean', meaning: '심해: 햇빛이 전혀 닿지 않는 극도의 고압과 암흑이 지배하는 미지의 심연' },
      { text: 'muneo', type: 'ocean', meaning: '문어: 여덟 개의 촉수와 주변 환경에 완벽히 동화되는 지능적인 두족류' },
      { text: 'gorae', type: 'ocean', meaning: '고래: 깊은 바닷속을 울리는 신비로운 노래로 교감하는 대양의 거인' },
      { text: 'pado', type: 'ocean', meaning: '파도: 바람과 해류의 에너지가 수면을 일렁이며 해안가로 밀려오는 물결' },
      { text: 'haegu', type: 'ocean', meaning: '해구: 해저 지각이 부딪치며 형성된 지구상 가장 깊고 험준한 바다 골짜기' }
    ],
    zh: [
      { text: 'haiyang', type: 'ocean', meaning: '海洋：覆盖地球绝大部分地表面积、蕴藏无尽深渊秘密的广阔水域' },
      { text: 'shayu', type: 'ocean', meaning: '鲨鱼：拥有敏锐电场感知器官与流线型躯体的远洋顶级掠食者' },
      { text: 'shanhu', type: 'ocean', meaning: '珊瑚：由无数微小水螅体分泌碳酸钙堆叠而成的五彩缤纷海底礁石' },
      { text: 'shenhai', type: 'ocean', meaning: '深海：阳光无法穿透、承受着巨大水压与永恒寂静的深海深层' },
      { text: 'zhangyu', type: 'ocean', meaning: '章鱼：拥有八条灵活触腕、极高智商并能根据环境瞬间拟态的软体生物' },
      { text: 'jingyu', type: 'ocean', meaning: '鲸鱼：依靠悠扬低沉的次声波歌声在各大洋中迁徙通信的庞然大物' },
      { text: 'haigou', type: 'ocean', meaning: '海沟：大洋板块向下俯冲形成的地球表面最深邃陡峭的峡谷' },
      { text: 'haichao', type: 'ocean', meaning: '海潮：在月球引力摄动下昼夜节律性涨落的海洋潮汐水流' }
    ]
  },

  // 5. COSMOS: Stellar Nebulae, Galaxies, Gravity & Space Astrophysics
  cosmos: {
    pt: [
      { text: 'estrela', type: 'cosmos', meaning: 'Esfera cósmica de plasma superaquecido que gera luz e calor por fusão nuclear' },
      { text: 'planeta', type: 'cosmos', meaning: 'Corpo celeste esférico em órbita estável ao redor de uma estrela central' },
      { text: 'orbita', type: 'cosmos', meaning: 'Trajetória curva e harmoniosa traçada por um astro sob efeito da força gravitacional' },
      { text: 'cometa', type: 'cosmos', meaning: 'Corpo gelado errante que desenvolve uma cauda brilhante de gás ao se aproximar do sol' },
      { text: 'meteoro', type: 'cosmos', meaning: 'Facho de luz incandescente gerado pela queima de matéria cósmica ao entrar na atmosfera' },
      { text: 'pulsar', type: 'cosmos', meaning: 'Estrela de nêutrons magnética de giro rápido que emite pulsos regulares de radiação' },
      { text: 'galaxia', type: 'cosmos', meaning: 'Vasto arquipélago gravitacional com bilhões de sistemas estelares, poeira e buracos negros' },
      { text: 'eclipse', type: 'cosmos', meaning: 'Alinhamento celeste no qual um astro bloqueia momentaneamente a luz de outro no espaço' },
      { text: 'gravidade', type: 'cosmos', meaning: 'Força cósmica fundamental que atrai massas e curva o tecido do espaço-tempo' }
    ],
    en: [
      { text: 'star', type: 'cosmos', meaning: 'Self-luminous stellar ball of plasma sustained by thermonuclear core fusion' },
      { text: 'planet', type: 'cosmos', meaning: 'Massive spherical world revolving peacefully around its illuminating host star' },
      { text: 'orbit', type: 'cosmos', meaning: 'Gravitationally locked curved trajectory traced through spacetime coordinates' },
      { text: 'comet', type: 'cosmos', meaning: 'Primordial cosmic dirty snowball venting glowing tails of ionized gas and vapor' },
      { text: 'meteor', type: 'cosmos', meaning: 'Brilliant streak of light ignited by atmospheric friction on incoming space debris' },
      { text: 'pulsar', type: 'cosmos', meaning: 'Rapidly rotating magnetized neutron star sweeping radio beacons across the cosmos' },
      { text: 'galaxy', type: 'cosmos', meaning: 'Immense swirling vortex of hundreds of billions of suns, dark matter, and nebulae' },
      { text: 'eclipse', type: 'cosmos', meaning: 'Geometric celestial alignment casting darkness across the face of an orb' },
      { text: 'gravity', type: 'cosmos', meaning: 'Fundamental universal attraction curving the fabric of space and dictating cosmic motion' }
    ],
    fr: [
      { text: 'etoile', type: 'cosmos', meaning: 'Sphère lumineuse de plasma alimentée en son cœur par la fusion thermonucléaire' },
      { text: 'planete', type: 'cosmos', meaning: 'Corps céleste massif en révolution ordonnée autour d\'un soleil central' },
      { text: 'orbite', type: 'cosmos', meaning: 'Trajectoire céleste fermée parcourue sous l\'influence de l\'attraction gravitationnelle' },
      { text: 'comete', type: 'cosmos', meaning: 'Astre glacé déployant une magnifique chevelure lumineuse à l\'approche d\'une étoile' },
      { text: 'pulsar', type: 'cosmos', meaning: 'Étoile à neutrons ultra-dense émettant des impulsions radio d\'une régularité absolue' },
      { text: 'galaxie', type: 'cosmos', meaning: 'Gigantesque ensemble lié par la gravité regroupant des milliards d\'étoiles' },
      { text: 'eclipse', type: 'cosmos', meaning: 'Phénomène d\'occultation totale ou partielle d\'un astre par un autre dans le ciel' },
      { text: 'gravite', type: 'cosmos', meaning: 'Force universelle invisible qui courbe l\'espace-temps et gouverne les mondes' }
    ],
    de: [
      { text: 'stern', type: 'cosmos', meaning: 'Glühender Plasmakörper, der durch kontinuierliche Kernfusion Licht ins All abstrahlt' },
      { text: 'planet', type: 'cosmos', meaning: 'Kugelförmiger Himmelskörper auf einer stabilen Umlaufbahn um sein Zentralgestirn' },
      { text: 'orbit', type: 'cosmos', meaning: 'Präzise berechenbare Bahn, auf der ein Satellit oder Planet ein Schwerkraftzentrum umkreist' },
      { text: 'komet', type: 'cosmos', meaning: 'Vereister Schweifstern, dessen flüchtige Gase im Sonnenwind leuchtend verdampfen' },
      { text: 'pulsar', type: 'cosmos', meaning: 'Extrem dichter Neutronenstern mit rasender Eigenrotation und gebündelter Strahlung' },
      { text: 'galaxie', type: 'cosmos', meaning: 'Spiraliges System aus Milliarden Sternen, Dunkler Materie und leuchtendem Gas' },
      { text: 'finsternis', type: 'cosmos', meaning: 'Kosmisches Schattenspiel, wenn sich ein Himmelskörper vor die Lichtquelle schiebt' }
    ],
    ja: [
      { text: 'hoshi', type: 'cosmos', meaning: '恒星：自らの核融合反応によって輝き、熱と光を放つ星' },
      { text: 'wakusei', type: 'cosmos', meaning: '惑星：恒星の周囲を一定の周期で静かに周回する球状の天体' },
      { text: 'kidou', type: 'cosmos', meaning: '軌道：重力に引かれながら天体が時空に描く永遠の運行曲線' },
      { text: 'suisei', type: 'cosmos', meaning: '彗星：氷と塵からなり、太陽に近づくと美しい尾を引く旅人' },
      { text: 'ginga', type: 'cosmos', meaning: '銀河：数千億の星々や星雲が重力によって渦を巻く巨大な星の島' },
      { text: 'chuuryoku', type: 'cosmos', meaning: '重力：星々を引き寄せ、宇宙の構造と時間を形作る根源的な力' },
      { text: 'uchu', type: 'cosmos', meaning: '宇宙：無数の星々と銀河、無限の広がりを持つ星間空間' }
    ],
    ko: [
      { text: 'byeol', type: 'cosmos', meaning: '별: 중심부의 핵융합 반응으로 스스로 빛과 열을 내뿜는 항성' },
      { text: 'haengseong', type: 'cosmos', meaning: '행성: 중심 별의 중력에 묶여 공전 궤도를 그리는 구형의 천체' },
      { text: 'gwedo', type: 'cosmos', meaning: '궤도: 중력 법칙에 따라 천체가 우주 공간에 그리는 일정한 비행로' },
      { text: 'eunha', type: 'cosmos', meaning: '은하: 수천억 개의 별과 성운이 거대한 나선을 그리며 공존하는 우주계' },
      { text: 'jungryeok', type: 'cosmos', meaning: '중력: 질량을 가진 모든 천체가 서로를 끌어당기는 우주의 기본 법칙' },
      { text: 'wooju', type: 'cosmos', meaning: '우주: 빛과 어둠, 시간과 공간이 팽창하며 펼쳐지는 무한한 영역' }
    ],
    zh: [
      { text: 'hengxing', type: 'cosmos', meaning: '恒星：核心进行剧烈热核聚变、源源不断向深空辐射光热的星体' },
      { text: 'xingqiu', type: 'cosmos', meaning: '行星：沿着固定公转椭圆轨道围绕中心恒星安静运行的天体' },
      { text: 'guidao', type: 'cosmos', meaning: '轨道：在引力摄动下天体在时空中划出的封闭几何运行路径' },
      { text: 'yinhe', type: 'cosmos', meaning: '银河：由千亿颗恒星系统与星际尘埃在暗物质引力下凝聚的宏大漩涡' },
      { text: 'yinli', type: 'cosmos', meaning: '引力：弯曲时空结构、决定恒星演化与宇宙终极宿命的基本作用力' },
      { text: 'yuzhou', type: 'cosmos', meaning: '宇宙：包含一切物质、能量与时空演变的无垠宏观存在' }
    ]
  },

  // 6. VOLCANO: Volcanic Calderas, Magma, Basalt & Tectonic Forges
  volcano: {
    pt: [
      { text: 'vulcao', type: 'volcano', meaning: 'Abertura colossal na crosta planetária por onde rochas fundidas e gases são expelidos' },
      { text: 'magma', type: 'volcano', meaning: 'Massa mineral incandescente e superaquecida retida nas câmaras profundas do manto' },
      { text: 'lava', type: 'volcano', meaning: 'Rocha fundida líquida e incandescente que extravasa à superfície esculpindo nova terra' },
      { text: 'cinzas', type: 'volcano', meaning: 'Nuvem piroclástica de minerais pulverizados que sobe em colunas escuras até a estratosfera' },
      { text: 'cratera', type: 'volcano', meaning: 'Depressão circular em forma de bocal no cume de um vulcão onde rugem as erupções' },
      { text: 'basalto', type: 'volcano', meaning: 'Rocha ígnea escura e ultra-resistente formada pelo resfriamento rápido de fluxos de lava' },
      { text: 'forja', type: 'volcano', meaning: 'Câmara tectônica de calor primordial onde minerais e ligas são moldados pelo fogo' },
      { text: 'geiser', type: 'volcano', meaning: 'Nascente hidrotermal subterrânea que expele jatos ferventes de vapor com força sísmica' },
      { text: 'rocha', type: 'volcano', meaning: 'Agregado sólido e compacto de minerais que forja a crosta e os alicerces continentais' }
    ],
    en: [
      { text: 'volcano', type: 'volcano', meaning: 'Crustal volcanic rupture venting superheated magma, pyroclasts and sulfurous plumes' },
      { text: 'magma', type: 'volcano', meaning: 'Subterranean reservoir of molten mineral liquid churning beneath tectonic plates' },
      { text: 'lava', type: 'volcano', meaning: 'Fiery incandescent liquid rock cascading across slopes and reshaping planetary crust' },
      { text: 'ash', type: 'volcano', meaning: 'Towering plume of pulverized tephra and glass particles darkening daytime skies' },
      { text: 'crater', type: 'volcano', meaning: 'Steep bowl-shaped caldera depression venting intense geothermal fury and eruptions' },
      { text: 'basalt', type: 'volcano', meaning: 'Dense dark volcanic igneous stone forged through rapid solidification of basaltic lava' },
      { text: 'forge', type: 'volcano', meaning: 'Subterranean furnace of volcanic temperatures purifying unyielding ores' },
      { text: 'geyser', type: 'volcano', meaning: 'Geothermal fissure erupting pressurized boiling water and steam columns into the air' },
      { text: 'rock', type: 'volcano', meaning: 'Solidified crystalline mineral foundation comprising the continental lithosphere' }
    ],
    fr: [
      { text: 'volcan', type: 'volcano', meaning: 'Fissure béante de l\'écorce terrestre crachant de la lave en fusion et des gaz brûlants' },
      { text: 'magma', type: 'volcano', meaning: 'Roche en fusion portée à très haute température dans les profondeurs du manteau' },
      { text: 'lave', type: 'volcano', meaning: 'Roche liquide incandescente qui s\'écoule le long des flancs du cratère actif' },
      { text: 'cendres', type: 'volcano', meaning: 'Nuage pyroclastique de roches pulvérisées projeté à haute altitude lors d\'une éruption' },
      { text: 'cratere', type: 'volcano', meaning: 'Dépression circulaire au sommet du volcan d\'où jaillissent les fontaines de feu' },
      { text: 'basalte', type: 'volcano', meaning: 'Roche magmatique sombre et dense issue du refroidissement rapide des coulées' },
      { text: 'forge', type: 'volcano', meaning: 'Fournaise géologique aux chaleurs extrêmes capable de fondre les métaux' },
      { text: 'geyser', type: 'volcano', meaning: 'Source hydrothermale crachant périodiquement des jets d\'eau bouillante sous pression' },
      { text: 'roche', type: 'volcano', meaning: 'Matière minérale solide et indestructible formant la croûte terrestre' }
    ],
    de: [
      { text: 'vulkan', type: 'volcano', meaning: 'Tektonische Öffnung der Erdkruste, durch die glühendes Magma und Gase emporsteigen' },
      { text: 'magma', type: 'volcano', meaning: 'Glühend flüssiges Gestein in den Tiefen der irdischen Magmakammer' },
      { text: 'lava', type: 'volcano', meaning: 'An die Oberfläche ausgetretenes feuriges Gestein, das langsam erstarrt' },
      { text: 'asche', type: 'volcano', meaning: 'Feinste pyroklastische Partikelwolke, die den Himmel über der Eruption verdunkelt' },
      { text: 'krater', type: 'volcano', meaning: 'Trichterförmige Öffnung auf dem Vulkangipfel, aus der Gase und Lava austreten' },
      { text: 'basalt', type: 'volcano', meaning: 'Dunkles, extrem hartes Ergussgestein, das aus abgekühlter Lava entsteht' },
      { text: 'geysir', type: 'volcano', meaning: 'Geothermale Quelle, die periodisch kochend heiße Wasser- und Dampffontänen ausstößt' },
      { text: 'stein', type: 'volcano', meaning: 'Festes mineralisches Fundament, aus dem die tektonischen Platten bestehen' }
    ],
    ja: [
      { text: 'kazan', type: 'volcano', meaning: '火山：地下深部からマグマやガスが噴出する大地の開口部' },
      { text: 'maguma', type: 'volcano', meaning: 'マグマ：地下深くで超高温によりドロドロに溶けた岩石流体' },
      { text: 'yougan', type: 'volcano', meaning: '溶岩：火口から地表へあふれ出し、大地を焼き尽くす灼熱の流体' },
      { text: 'hai', type: 'volcano', meaning: '火山灰：噴火に伴い空高く吹き上げられ空を覆う微細な岩石粉末' },
      { text: 'kakou', type: 'volcano', meaning: '火口：煮えたぎるマグマと噴煙を噴き上げる火山の頂上開口部' },
      { text: 'honoo', type: 'volcano', meaning: '焔：マグマの熱気とガスが激しく燃え盛る大地を焦がす炎' },
      { text: 'iwa', type: 'volcano', meaning: '岩石：冷え固まった溶岩が気の遠くなる時間を経て生み出す頑強な鉱物' }
    ],
    ko: [
      { text: 'hwasan', type: 'volcano', meaning: '화산: 지각의 균열을 통해 고온의 마그마와 화산 가스가 분출하는 거대한 산' },
      { text: 'magma', type: 'volcano', meaning: '마그마: 지하 깊은 곳의 초고온 환경에서 액체 상태로 녹아 있는 암석 융용물' },
      { text: 'yong-am', type: 'volcano', meaning: '용암: 지표면으로 흘러나와 대지를 뒤덮으며 식어가는 붉은 불의 강' },
      { text: 'jae', type: 'volcano', meaning: '화산재: 폭발적 분화 시 대기 중으로 높이 치솟아 하늘을 가리는 암석 가루' },
      { text: 'hwagoo', type: 'volcano', meaning: '화구: 부글거리는 용암 호수와 화산 가스를 토해내는 산 정상의 분화구' },
      { text: 'bul', type: 'volcano', meaning: '불길: 마그마의 맹렬한 지열로 인해 화산 주위를 집어삼키는 불꽃' },
      { text: 'bawi', type: 'volcano', meaning: '바위: 굳어진 화산암이 오랜 세월을 거쳐 형성한 단단한 광물 덩어리' }
    ],
    zh: [
      { text: 'huoshan', type: 'volcano', meaning: '火山：地壳板块缝隙中释放高温熔岩、火山灰与高压气体的天然喷口' },
      { text: 'yanjiang', type: 'volcano', meaning: '岩浆：存在于地球深部地幔、处于超高温高压熔融状态的液态矿物' },
      { text: 'rongyan', type: 'volcano', meaning: '熔岩：喷出地表后奔涌流淌、所到之处重塑地貌的炽热火红岩流' },
      { text: 'huohui', type: 'volcano', meaning: '火山灰：剧烈喷发时被送上万米平流层、遮天蔽日的细微矿物碎屑' },
      { text: 'huokou', type: 'volcano', meaning: '火山口：位于火山顶部、不断喷吐滚烫地热气体与熔岩柱的碗状凹坑' },
      { text: 'lihuo', type: 'volcano', meaning: '烈火：在极端地热能量驱动下肆虐翻腾的熔融之焰' },
      { text: 'yanshi', type: 'volcano', meaning: '岩石：由玄武岩熔岩冷却固化形成的地壳固态基岩骨架' }
    ]
  }
};

function getThemedWordsForBoss(bossType, lang = 'en') {
  const typeWords = BOSS_WORDS_BY_TYPE[bossType] || BOSS_WORDS_BY_TYPE.robot;
  const langWords = typeWords[lang] || typeWords.en || typeWords.pt;
  return langWords || [];
}

// Wildcard words — destroy all items on screen when typed
const WILDCARD_WORDS = ['BOOM', 'BANG', 'NOVA', 'WARP', 'CHAOS'];

// ================================================
// CENTRAL SOURCE OF TRUTH: SKILLS & SHOP ITEMS
// ================================================

// 1. ACTIVATABLE RUNIC SKILLS (8 total — bound to keys 1–8)
const SKILLS_CONFIG = {
  freezer: {
    id: 'freezer',
    icon: '❄️',
    name: 'Freeze',
    namePt: 'Congelar',
    desc: 'Freezes all runics for 10s (auto-cancels if screen cleared)',
    descPt: 'Congela todos os rúnicos por 10s (auto-desliga se a tela for limpa)',
    duration: 10000,
    basePrice: 300,
    color: '#06B6D4',
    category: 'skill',
    activateMsg: '❄️ FREEZER ATIVO (10s)!',
    expireMsg: '❄️ Descongelado!',
    onActivate: (st) => {
      st.activeItems.forEach(i => i.el?.classList.add('frozen'));
    },
    onExpire: (st) => {
      st.activeItems.forEach(i => i.el?.classList.remove('frozen'));
    }
  },
  bomb: {
    id: 'bomb',
    icon: '💣',
    name: 'Bomb',
    namePt: 'Bomba',
    desc: 'Multi-line area blast wave for 10s (scaled with word length)',
    descPt: 'Onda de choque em área por 10s (escala com tamanho do vocábulo)',
    duration: 10000,
    basePrice: 450,
    color: '#FF4757',
    category: 'skill',
    activateMsg: '💣 BOMBA ATIVADA (10s)!',
    expireMsg: '💣 Bomba expirou',
    onActivate: () => {
      if (typeof playSound === 'function') playSound('bomb');
    },
    onExpire: () => {}
  },
  shield: {
    id: 'shield',
    icon: '🛡️',
    name: 'Runic Shield',
    namePt: 'Imunidade',
    desc: 'Protects against dropped runics and typo penalties for 10s',
    descPt: 'Protege contra rúnicos caídos e erros de digitação por 10s',
    duration: 10000,
    basePrice: 390,
    color: '#10B981',
    category: 'skill',
    activateMsg: '🛡️ IMUNIDADE ATIVA (10s)!',
    expireMsg: '🛡️ Imunidade expirou',
    onActivate: () => {},
    onExpire: () => {}
  },
  vortex: {
    id: 'vortex',
    icon: '🌀',
    name: 'Vortex',
    namePt: 'Vórtice',
    desc: 'Devours the lowest dangerous runic every 2s for 10s',
    descPt: 'Devora o rúnico mais urgente a cada 2s por 10s',
    duration: 10000,
    basePrice: 420,
    color: '#8B5CF6',
    category: 'skill',
    activateMsg: '🌀 VÓRTICE ATIVO (10s)!',
    expireMsg: '🌀 Vórtice expirou',
    onActivate: (st) => {
      st.vortexAccum = 0;
    },
    onExpire: () => {}
  },
  slowdown: {
    id: 'slowdown',
    icon: '⏱️',
    name: 'Slow-Mo',
    namePt: 'Desaceleração',
    desc: 'Slows down runic fall speed by 50% for 15s',
    descPt: 'Reduz a velocidade de queda dos rúnicos em 50% por 15s',
    duration: 15000,
    basePrice: 240,
    color: '#3B82F6',
    category: 'skill',
    activateMsg: '⏱️ SLOWDOWN ATIVO (15s)!',
    expireMsg: '⏱️ Desaceleração encerrou',
    onActivate: () => {
      const ring = typeof slowRing !== 'undefined' ? slowRing : document.getElementById('slow-ring');
      ring?.classList.add('active');
    },
    onExpire: () => {
      const ring = typeof slowRing !== 'undefined' ? slowRing : document.getElementById('slow-ring');
      ring?.classList.remove('active');
    }
  },
  haste: {
    id: 'haste',
    icon: '⚡',
    name: 'Double Points',
    namePt: 'Pontos em Dobro',
    desc: '+0.5 speed and 2× points multiplier for 15s',
    descPt: 'Aumenta velocidade em +0.5 e dobra todos os pontos (2×) por 15s',
    duration: 15000,
    basePrice: 240,
    speedBonus: 0.5,
    color: '#FF9F1A',
    category: 'skill',
    activateMsg: '⚡ PONTOS EM DOBRO ATIVO (15s)!',
    expireMsg: '⚡ Pontos em dobro expirou',
    onActivate: () => {},
    onExpire: () => {}
  },
  speedlock: {
    id: 'speedlock',
    icon: '🔒',
    name: 'Speed Lock',
    namePt: 'Trava Velocidade',
    desc: 'Locks speed at 1.0× for 60s, preventing typo penalties',
    descPt: 'Trava a velocidade em 1.0× por 60s, impedindo acelerações por erro',
    duration: 60000,
    basePrice: 540,
    color: '#38BDF8',
    category: 'skill',
    activateMsg: '🔒 VELOCIDADE TRAVADA EM 1.0× (60s)!',
    expireMsg: '🔒 Trava de velocidade encerrou',
    onActivate: (st) => {
      st.speedMultiplier = 1.0;
    },
    onExpire: () => {}
  },
  dilation: {
    id: 'dilation',
    icon: '🌌',
    name: 'Spacing',
    namePt: 'Espaçamento',
    desc: 'Increases vertical distance and interval between runics for 45s',
    descPt: 'Aumenta o espaçamento e intervalo entre rúnicos por 45s',
    duration: 45000,
    basePrice: 480,
    color: '#A855F7',
    category: 'skill',
    activateMsg: '🌌 ESPAÇAMENTO AUMENTADO (45s)!',
    expireMsg: '🌌 Espaçamento encerrou',
    onActivate: () => {},
    onExpire: () => {}
  }
};

// 2. SHOP ITEMS (Immediate consumables / special non-slot items)
const SHOP_ITEMS_CONFIG = {
  continue: {
    id: 'continue',
    icon: '🪙',
    name: 'Continue Token',
    namePt: 'Ficha Continue',
    desc: 'Instant revival on Game Over in same phase',
    descPt: 'Revive instantaneamente na mesma fase ao perder todas as vidas',
    basePrice: 900,
    color: '#EAB308',
    isItem: true,
    category: 'item'
  },
  wordpack: {
    id: 'wordpack',
    icon: '📦',
    name: 'Mystery Pack',
    namePt: 'Pacote Misterioso',
    desc: 'Instantly unlocks 3 random words for your Library',
    descPt: 'Desbloqueia instantaneamente 3 palavras secretas para sua Biblioteca',
    basePrice: 330,
    color: '#EC4899',
    isItem: true,
    category: 'item'
  },
  extralife: {
    id: 'extralife',
    icon: '❤️',
    name: '+1 Life',
    namePt: '+1 Vida',
    desc: '+1 permanent life to reserve for this run (up to 6)',
    descPt: '+1 vida permanente para a reserva da partida (até 6)',
    basePrice: 600,
    color: '#EF4444',
    isItem: true,
    category: 'item'
  }
};

const SKILLS_LIST = Object.values(SKILLS_CONFIG);
const SHOP_ITEMS_LIST = Object.values(SHOP_ITEMS_CONFIG);
const SKILLS_ALL = [...SKILLS_LIST, ...SHOP_ITEMS_LIST];

// All 6 Achievements (including the new Typography Master!)
const ACHIEVEMENTS = [
  { id: 'dedo_veloz',   icon: '⚡', name: 'Speed Demon',        desc: 'Reach 60 WPM.',                              target: 60,  unit: 'WPM' },
  { id: 'cirurgico',    icon: '🎯', name: 'Surgical',           desc: 'Complete any phase with 100% accuracy.',      target: 100, unit: '%' },
  { id: 'colecionador', icon: '📖', name: 'Collector',          desc: 'Unlock all words in the Library.',           target: 30,  unit: 'words' },
  { id: 'mestre_combo', icon: '🔥', name: 'Combo Master',       desc: 'Reach 30 consecutive correct keystrokes.',   target: 30,  unit: 'hits' },
  { id: 'modo_furia',   icon: '💥', name: 'Fury Mode',          desc: 'Activate Fury Mode with 15 hits in a row.',  target: 15,  unit: 'combo' },
  { id: 'mestre_tipo',  icon: '✍️', name: 'Typography Master',  desc: 'Complete 100 full words.',                   target: 100, unit: 'words' },
];

function wordPts(text) {
  return (text || '').length * 3;
}

// Training Mode Definitions by Language
const TRAINING_WORLDS_DATA = {
  en: {
    1: {
      id: 1,
      name: 'World 1: Home Row',
      subtitle: 'Home Row (A S D F G H J K L ;)',
      desc: 'Muscle memory for finger resting position (left hand ASDF, right hand JKL;).',
      icon: '🖐️',
      color: '#38BDF8',
      chars: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'],
      words: ['AS', 'ALL', 'FALL', 'GLAD', 'HALF', 'LAD', 'DASH', 'FLASH', 'GLASS', 'SALAD', 'FLASK', 'HALL', 'FLAG', 'LADS', 'FALLS', 'SHALL'],
    },
    2: {
      id: 2,
      name: 'World 2: Top Row',
      subtitle: 'Top Row (Q W E R T Y U I O P)',
      desc: 'Reach training for index, middle and ring fingers across the upper keyboard.',
      icon: '⬆️',
      color: '#F59E0B',
      chars: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      words: ['TRY', 'TREE', 'POWER', 'QUIET', 'TYPE', 'WRITE', 'ROPE', 'TOWER', 'ROUTE', 'POET', 'PORT', 'TRIP', 'WIRE', 'PITY', 'PURE', 'ROTE'],
    },
    3: {
      id: 3,
      name: 'World 3: Bottom Row',
      subtitle: 'Bottom Row (Z X C V B N M)',
      desc: 'Downward finger dexterity, fine motor speed and bottom row keyboard coordination.',
      icon: '⬇️',
      color: '#10B981',
      chars: ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
      words: ['MAN', 'CAN', 'VAN', 'BOX', 'MIX', 'ZONE', 'CAMP', 'BOMB', 'NAME', 'MINE', 'VIBE', 'CAVE', 'NAVY', 'COMB', 'MAZE', 'ZINC'],
    },
    4: {
      id: 4,
      name: 'World 4: Numbers & Symbols',
      subtitle: 'Numbers & Symbols (1 2 3 4 5 ? ! , .)',
      desc: 'Mastery of upper number digits, questions, exclamations and essential punctuation marks.',
      icon: '✨',
      color: '#EC4899',
      chars: ['1', '2', '3', '4', '5', '?', '!', ',', '.'],
      words: ['GO!', 'RUN!', 'HOW?', 'YES!', '1, 2, 3', 'STOP.', 'WAIT!', 'WHO?', 'NOW.', 'WOW!', 'FAST!', 'GOAL!'],
    }
  },
  pt: {
    1: {
      id: 1,
      name: 'Mundo 1: Linha Base',
      subtitle: 'Linha central (A S D F G H J K L Ç)',
      desc: 'Memória muscular da linha central de repouso dos dedos (mão esquerda ASDF, mão direita JKLÇ).',
      icon: '🖐️',
      color: '#38BDF8',
      chars: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
      words: ['AS', 'DA', 'FA', 'LA', 'JA', 'HA', 'FADA', 'GALA', 'SALA', 'FALA', 'ALFA', 'HAJA', 'DADA', 'FALAS', 'SALAS', 'ADAGA', 'ALFAMA', 'CASAL'],
    },
    2: {
      id: 2,
      name: 'Mundo 2: Linha Superior',
      subtitle: 'Linha superior (Q W E R T Y U I O P)',
      desc: 'Extensão para a linha superior treinando o alcance com indicadores, médios e anelares.',
      icon: '⬆️',
      color: '#F59E0B',
      chars: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      words: ['RE', 'TO', 'PO', 'WE', 'QUI', 'TRE', 'PATO', 'ROTO', 'TOPO', 'PERA', 'REDE', 'POTE', 'QUERO', 'PORTA', 'TERRA', 'PIPO', 'TIPO', 'ROUPA', 'TORRE', 'PRATO'],
    },
    3: {
      id: 3,
      name: 'Mundo 3: Linha Inferior',
      subtitle: 'Linha inferior (Z X C V B N M)',
      desc: 'Alcance para a linha inferior com agilidade e coordenação motora fina.',
      icon: '⬇️',
      color: '#10B981',
      chars: ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
      words: ['ZA', 'CA', 'VA', 'BA', 'NA', 'MA', 'BOM', 'VEM', 'NOZ', 'VEZ', 'BOLA', 'MESA', 'ZEBRA', 'NAVIO', 'CAMINHO', 'ZONA', 'VOZ', 'BARCO', 'NUVEM', 'VENTO'],
    },
    4: {
      id: 4,
      name: 'Mundo 4: Acentos & Pontuações',
      subtitle: 'Acentos e pontuações (Á Ê Õ ? ! , .)',
      desc: 'Domínio de teclas de acentuação gráfica, interrogação, exclamação e pontuações essenciais.',
      icon: '✨',
      color: '#EC4899',
      chars: ['Á', 'É', 'Í', 'Ó', 'Ú', 'Â', 'Ê', 'Ô', 'Ã', 'Õ', 'Ç', '?', '!', ',', '.'],
      words: ['Á', 'É', 'Í', 'Ó', 'Ú', 'NÃO', 'SIM!', 'OLÁ', 'VOVÔ', 'MAÇÃ', 'ATENÇÃO', 'VOCÊ?', 'BOM!', 'POR QUÊ?', 'JÁ', 'ATÉ', 'CAFÉ', 'PAPAI!', 'QUEM?'],
    }
  }
};

function getTrainingWorlds() {
  const lang = (typeof getLanguage === 'function') ? getLanguage() : 'en';
  return TRAINING_WORLDS_DATA[lang] || TRAINING_WORLDS_DATA.en;
}

const TRAINING_WORLDS = getTrainingWorlds();
