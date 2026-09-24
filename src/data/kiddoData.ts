import { CharacterItem, RoomLocation, ToyProp } from '../types';

export const APP_IMAGES = {
  logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGnaG-GeIB3EGkjRXJl2UfrjzB2dY-9xRcAbV8bX5-XxRL7w3TxhbBbY6-pHtEE4_MdXpL7vofl94J194kiqz9ievU1l_1UMq_WuGGmZIiNd2NlnKr8bphsMAB_5-a8IUPq-jYDtume8zwska7KXqVDpWpihxD-hbd3g5r_4_9pWF_rnd7bLeNFJpITUOBGuVq4KteUAQcHuWXeIjxs4vutsyyhWBHFmYBavqdAfgvEFx0Xzi3aaJg',
  worldIsland: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhc8lfdCtmGGVj0FOaS3R3jXKgPfiMKGlaKqLJ_1CNCV9ldxG8qmZZheNMLZOEEPEeyev5CCZEee5T-5PRP7_XSbgrhXACbIZOpznlAM03ErxM1nrg1R0Azy6SpqO9szmTOmDp53HXPzIsdfl_oCBlTc_vAGKr62TBNzZI3Brs81CTssSfj09QRWnFzr2W_NrXMLei6ABx_cNlH1tc_Tq36SELvS7SCZl0oG-MdRfW9w5yktqkrzCZ',
  apartment: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7MJA8XfLB78eQXTjLjqmWBh4YBW5OZjMtul9IRVmMXNnPFPLNkKYxBGE1iX3KInv46gq69gXTQZ4W2JeemrBX3fcdTEWZ3wp0CNLgq6cqTWPt1Bn1x6kzNppQfOEkqQXZADqG7I3tFiK6C8EUJk-7Bc4fXUrxNY7mmFs8xz7Emr23scv4ZiSLtgiFgxPz1d4IEBccFhKIQoX8CSyCOJZIVgEOB6vQCGmG9weymb60ejJ264bFPTvB',
  playground: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXH3s5AaTnayLBaISx-BZJuoa8m9Pl1vzR8h5mZYMzq2Xi6Y2-dYlO0m7FolRuJygTsyD7rnm356LArf6RgguArMPV4PXRJqVIhlWFyIxqG9J7GrKn04TtGVFgD8xd9D2H_B9V8nW1_vLC-TYPk_zXyRy1Sn--9nexg9VwdSvJLJGFGD5nwRx-w9n_U-I_06jcQIf1NfmwCR_ncd3wJN8H6zzHEXrj2UdFFGu9_MIOJhhiiEyHqSmv',
  bakery: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5VpXs27GZI16nmROsqEZQ71RlNSSyOp-f_SKujhK401mATOhzCT0-jWUf1AUmOya66x-tAXeKleHPF_l7D1AA4_eg4hFvlar9Io38WCjIPFCrneIfDd9cCWcFY76nP5Ql1i3eqP8QdSTbvQp6anU-UzNmzWwGSPaeK1Pgtc8_xoyPtP0CEuzn7xP-NszhHTQa6wZTrwmMZ3B2Ubu5g1XOltXv8COl2tIew1Jcf4aCMwl6aHLYgnrJ',
  artSchool: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjUIH6U_YUDDvOeNY8qr_u9W2t9sXcyM46myKkiD945QN04IWb7qBMHAETtLtZKDp_hciaVRozXmFk1tbWD1A56EtXN-rTjCSbxD8iczb5r4RxuSXxd7Tw_58rEG-R3wwofj0rMUQ3PUx783wl_Rehdvp-EvCXSKZ1szQ8-1pHTMS3JFWyGAA-OfJ59wwjPdtF_aMMQzZRzYSayB2ATYyLi7bgFNwq_h2Ks_FUz7mCkNClHYs1GjB5',
  beach: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3APp8rxnYz7bv7zn39ipXnUchtiBfzfs7KYmLQmxaV4xlkRlUVAJQg-dRzwTHsAayK_f3SrI72HLQsjdTe8iIYtw4t8a8gxuAOEsCL7JDSKWPV8uaXMCrDboQ31DZTOkjja6wAldy1YZ9_w5wpu0poEaXy5rXWN9jjnv0b7sxxzh8sgOGpFMcsFrfZVnVcQXq7bWlielaIrZFtZGsM6Sbfz6lZqk_OKU5qMT7jE3AIZF9FK-8zmrW',
  zosiaFull: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCemsTSVNtE8n_GthWyLBxp_qvDy14oz7TbGj-Be2wdSgSQPEiy1mDn0H3m_c1PEmJlpM_2UK3_kBmVUwiE02neoJMPcEgpUGhJK2LFYHP0DwdiUnRjCs5T0piDsZC820z6i-yF-w9Kj7j5ZalbNDWRaOVEBw77qkKa9wPwNVlbF38GRUTUifH6pEnaAiN_xK4x-fuR0RxpyqBiivc-C3kO4K6u0XfTOG4NdG38hBS4sIQ-t8Huzzaw',
  leonFull: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABwY-o4EOdcVj91Ug_Dm2EQq5Go47Ar5NfBTz1lrgnJFmuy5wn5FCnavZM74LlVOWM-MqgRg6WlEaKLxr4pYnT6EiJvFvFpE5j2MsINcUFtFvsHzT_Sy3x8WHEMhRjXs-O1u8ICdTEWOqTlAB7aNRl9lLHHSt7djSsNoH9vj5jMBoZ5DGrMfFhwdcLJVVzRH-BD2YgpT4pDa8FHQ2pCrjOlL-CORojMfQoxGh7NahxnM-WaZiySHpT',
  kittenKosmo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwW37DmnLezxo5VCjH9nJ7Z-XuzgiApMoD2NrbF-fDM0E7wrF1UF9n7q1Ap8m5K_PJGyopoyE9yHa33-RoyBCmQhZpnLpH9fqQ5cgkhtW7UdQ7gmVDFTY5dekUVvlqvItwHerlJL5m_BtrsP-1dGiIyN4-LwzUdz3d2nUN2y-TD22pHRe4Wt0931ZQ8a-GZoNuWUi4MGemU7oPEM-ix3ewPGymE6vihcCU5ov9QK0jzAOPeIv7Af0m',
  puppyBabel: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkApSCGzsD4KHfqTDSr5MJ4Gxit6AfyeJ2G210uXvoEF_qbmycAvtb3PEXRXN8dmZn6NeZNKD8AlMrEobuVsWV5ia_WZkEZvBQSfwwKyew9nlgP5tYnzPTeCzAPApi1B5PhpXv-XfJa1haMZdidJTKX_r-QZ4F401zoOTDRFaC0eP5azNrJNihBz9tlIAw5JLa4Kx0FYAys4JtW3V0wU558vomEZvBJWTPhpZNxcp6K7MSvJSBqYQo',
  backpackRoomBackdrop: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDS2ggBVQQAlmEWENb114r4M1JqodfCIRXuE4p06uxwRsGwo5RUkI16GXNN3YhcA-fXIfpiKqzOaA9JmNWU_jrz8ARUfgnZX-b6aVx3pnQZtugpRFV41NbOEskLRa1Myv6tIxS12bA0dKj0oYoQ9nr8gV6CiYwpnDtz9pXJ-p6cyjTpcPiVFJBMPWkc1oSi4dMk_CII_SkPJRspSnc-3qgz7JsLg2T_-64YN7Lb2IRAYFT0bWlP6kxe',
  tomekAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6IrLawniCiOHpWgp6hMt_vTSUX-B-IHcrSQoNuMplRoV31VkhgopL4vUuVw3PAOxUdDRPHwMW7X76TWEiR1h-Uu-XyDJVX77hk5F-vVVafGP8Qj63HINaOZxiFAIFEZq5C3X1rBZQwo_vZq88QlJFyA9D2FKb07_0ChXDz7aF6Eoyg_BR1EKWkJPx9sPmFPiKZJEHX7rR4PpXUjE7oziEMXidgAsRLhNnxZG19F5oDH1JFZy1JcNd',
  zosiaAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8VlwMrWgYXLqI4LKv4QUO5HxETuORH7jkspnKoWpnaXK53yQeP7d_DEfmLNT0_OBn8-D2njYlmPaYdH9uFcDp1jpSRpJ2nSbQzxj5uqTK8raJDR4UVGCzONsR5rcPx_4yK68dzjoaarofs6Q69KDtcel8pjMtD_ICnnaqGD6JZgp54pOcMG8I-J-ZFfxraEaITim7jh03ZDIEMbPelTyQAEL_eUvtqPEnlPg_1CYlfTM6Vc_04udU',
  leonAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3nReT7icQlLcYuAf4YYesIUTGlyjKLzxD0BQyzD2I4K9iILXPiTIlf6hGdYktsm-pyU1cAH0RurD__WlQENoMeeWzCpWaxUjNdTYBiLyMmwGT_3RITIoTSu_iHE0-HX0yLcuZM19U6CmKNqLuFt8IlkOyucKiQaCIyNIQvHGRFaT4rviXCClzE-eK_Jm_APr3uttXXdYYmvSSJ8SwV-ox6YJa4-OyXv0tDbJOEncjIms7uK-SvbfO',
  majaAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWiGiV-pvC28zIBJ2UFUlUL4WWiXTVyTgXCUI23AwGLpgbd0FEvYWcaWtJ08Fl-5sEDRESToPAH1xn6YmA0RM3yVaPJuWmMWE5D0RpjjrdzVNAGd9YIVRC__DL9Skh1jGyNyJ3nX-2XD0UC-00EBT5bl1AsoU31jishRO6Tk45glD74hw9E9j-2PZJM5bcWZOtywQt19AqW8Z_BSbeLpeZoVqpJ0pMpYiJZEXwSGEgaNbg-2uZXeHj',
  kacperAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC22K_I8qw1bD0yohVxrayZp0u4cd1nyCEnO5JaWRXonxIzRylMhwaSRwVEKj3GZulRLczuwMitxbvHnsLNnWFgTD6OQYEBgsDf2xAva27qYvQv7nXgI7gVxLs5c67FESOFaj-ho4DGauTQKKGc9Byp1nAJBUu0BJkzD5PMbgHoulnTkT4rCjiLdlf0QILgAhwU9DdiydD-IWiA3FIOEotccvp_meeS0XG-5rcau2BSvVlzi6JkWYbi',
  olekAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpe950tsOMHqgI2emnG9W3UzFGkkXnYb-sb7aMjRDm5caz_VktbkExZGrzmPGGtSFcbBRp_bemxTvNk9yb9qVLgQ2f51DBdNccjPvNrHLKwTj1sn7YE3Zu_kRRGHFTmlo0yFcVuvR_GY5Gv2FNQrfTgXW9y-AhCvNoAYHsSWlZYwLebavbpb63mhrHA6uSZ0TqPgUo92L2lFFuL68ShfkXvLPBDA1kmJvFyI8R15w985v3ylezR2eE'
};

export const LOCATIONS: RoomLocation[] = [
  {
    id: 'apartment',
    name: 'Mieszkanie Przyjaciół',
    subtitle: 'Impreza w salonie, gotowanie i sypialnia z balkonem',
    description: 'Przytulny domek pełen interaktywnych mebelków, lodówki ze smakołykami, telewizora z bajkami i miękkiej kanapy.',
    badge: 'Ulubione',
    badgeIcon: 'favorite',
    badgeBg: 'bg-primary text-on-primary',
    badgeText: 'text-on-primary',
    imageUrl: APP_IMAGES.apartment,
    isFavorite: true,
    friendsCount: 4
  },
  {
    id: 'playground',
    name: 'Słoneczny Park i Plac Zabaw',
    subtitle: 'Zjeżdżalnie, bujaki, piaskownica i latawce na wietrze',
    description: 'Kolorowy plac zabaw z kręcącą się karuzelą, dinozaurzą zjeżdżalnią i zielonym trawnikiem na piknik.',
    badge: 'Karuzela działa',
    badgeIcon: 'attractions',
    badgeBg: 'bg-tertiary-fixed text-on-tertiary-fixed',
    badgeText: 'text-on-tertiary-fixed',
    imageUrl: APP_IMAGES.playground,
    friendsCount: 3
  },
  {
    id: 'bakery',
    name: 'Cukiernia i Bar Owocowy',
    subtitle: 'Mieszaj smaki koktajli, dekoruj torty i częstuj gości',
    description: 'Słodki zakątek pełen babeczek truskawkowych, lodów w wafelkach, blenderów owocowych i pastelowych stolików.',
    badge: 'Pieczenie ciastek',
    badgeIcon: 'cake',
    badgeBg: 'bg-primary-fixed text-on-primary-fixed',
    badgeText: 'text-on-primary-fixed',
    imageUrl: APP_IMAGES.bakery,
    friendsCount: 2
  },
  {
    id: 'artSchool',
    name: 'Szkoła Talentów i Plastyka',
    subtitle: 'Maluj obrazy, graj na pianinie i wystawiaj teatrzyk kukiełkowy',
    description: 'Kreatywna pracownia ze sztalugami, tęczowymi farbami, instrumentami muzycznymi i sceną teatralną.',
    badge: 'Pracownia farb',
    badgeIcon: 'palette',
    badgeBg: 'bg-secondary-fixed text-on-secondary-fixed',
    badgeText: 'text-on-secondary-fixed',
    imageUrl: APP_IMAGES.artSchool,
    friendsCount: 5
  },
  {
    id: 'beach',
    name: 'Błękitna Plaża i Latarnia',
    subtitle: 'Nurkowanie za skarbami, budowa zamków i rejs motorówką',
    description: 'Ciepły złoty piasek, wesołe delfiny skaczące w falach, parasole przeciwsłoneczne i zabytkowa latarnia morska.',
    badge: 'Łódki & Muszelki',
    badgeIcon: 'sailing',
    badgeBg: 'bg-secondary-container text-on-secondary-container',
    badgeText: 'text-on-secondary-container',
    imageUrl: APP_IMAGES.beach,
    friendsCount: 3
  }
];

export const PRESET_CHARACTERS: CharacterItem[] = [
  {
    id: 'zosia',
    name: 'Zosia',
    role: 'Liderka zabawy',
    avatarUrl: APP_IMAGES.zosiaAvatar,
    skinColor: '#f9c9b0',
    hairStyle: 'buns',
    hairColor: '#b388ff',
    eyeType: 'big-sparkle',
    mouthType: 'joy-open',
    outfit: 'sweater',
    outfitColor: '#ffea79',
    hat: 'cat-ears',
    glasses: 'none',
    currentEmotion: 'Radość',
    x: 28,
    y: 52
  },
  {
    id: 'leon',
    name: 'Leon',
    role: 'Mały Odkrywca',
    avatarUrl: APP_IMAGES.leonAvatar,
    skinColor: '#f4b294',
    hairStyle: 'curly',
    hairColor: '#4a2c20',
    eyeType: 'starry',
    mouthType: 'big-smile',
    outfit: 'dungarees',
    outfitColor: '#70f8e8',
    hat: 'none',
    glasses: 'round',
    currentEmotion: 'Śmiech',
    x: 65,
    y: 54
  },
  {
    id: 'maja',
    name: 'Maja',
    role: 'Artystka',
    avatarUrl: APP_IMAGES.majaAvatar,
    skinColor: '#f9c9b0',
    hairStyle: 'bob',
    hairColor: '#c59b27',
    eyeType: 'happy-curved',
    mouthType: 'big-smile',
    outfit: 'casual',
    outfitColor: '#ad2c4f',
    hat: 'beanie',
    glasses: 'none',
    currentEmotion: 'Śpiew',
    x: 48,
    y: 50
  },
  {
    id: 'kacper',
    name: 'Kacper',
    role: 'Mistrz Klocków',
    avatarUrl: APP_IMAGES.kacperAvatar,
    skinColor: '#f9c9b0',
    hairStyle: 'spiky',
    hairColor: '#d2691e',
    eyeType: 'winking',
    mouthType: 'joy-open',
    outfit: 'casual',
    outfitColor: '#3b82f6',
    hat: 'cap',
    glasses: 'none',
    currentEmotion: 'Radość',
    x: 18,
    y: 55
  },
  {
    id: 'olek',
    name: 'Olek',
    role: 'Kosmonauta',
    avatarUrl: APP_IMAGES.olekAvatar,
    skinColor: '#f9c9b0',
    hairStyle: 'short',
    hairColor: '#583626',
    eyeType: 'big-sparkle',
    mouthType: 'joy-open',
    outfit: 'astronaut',
    outfitColor: '#e0e7ff',
    hat: 'none',
    glasses: 'star',
    currentEmotion: 'Zdziwienie',
    x: 82,
    y: 52
  },
  {
    id: 'tomek',
    name: 'Tomek',
    role: 'Przyjaciel',
    avatarUrl: APP_IMAGES.tomekAvatar,
    skinColor: '#f9c9b0',
    hairStyle: 'curly',
    hairColor: '#583626',
    eyeType: 'big-sparkle',
    mouthType: 'big-smile',
    outfit: 'sweater',
    outfitColor: '#006a62',
    hat: 'none',
    glasses: 'none',
    currentEmotion: 'Radość',
    x: 38,
    y: 56
  }
];

export const TOY_PROPS: ToyProp[] = [
  {
    id: 'puszek',
    name: 'Puszek',
    subtitle: 'Piesek',
    category: 'pets',
    iconName: 'pets',
    imageUrl: APP_IMAGES.puppyBabel,
    colorBg: 'bg-secondary-fixed/40',
    colorText: 'text-secondary'
  },
  {
    id: 'kosmo',
    name: 'Kosmo',
    subtitle: 'Kotek astronauta',
    category: 'pets',
    iconName: 'cruelty_free',
    imageUrl: APP_IMAGES.kittenKosmo,
    colorBg: 'bg-primary-fixed/40',
    colorText: 'text-primary'
  },
  {
    id: 'deska',
    name: 'Deska',
    subtitle: 'Neonowa',
    category: 'toys',
    iconName: 'skateboarding',
    colorBg: 'bg-primary-fixed/40',
    colorText: 'text-primary'
  },
  {
    id: 'aparat',
    name: 'Aparat',
    subtitle: 'Błyskawiczny',
    category: 'toys',
    iconName: 'photo_camera',
    colorBg: 'bg-tertiary-fixed/40',
    colorText: 'text-tertiary'
  },
  {
    id: 'babeczka',
    name: 'Babeczka',
    subtitle: 'Truskawka',
    category: 'food',
    iconName: 'bakery_dining',
    colorBg: 'bg-primary-container/20',
    colorText: 'text-primary'
  },
  {
    id: 'soczek',
    name: 'Soczek',
    subtitle: 'Ze słomką',
    category: 'food',
    iconName: 'local_cafe',
    colorBg: 'bg-secondary-fixed/50',
    colorText: 'text-on-secondary-container'
  },
  {
    id: 'pad',
    name: 'Pad z grą',
    subtitle: 'Mini Kiddo',
    category: 'toys',
    iconName: 'tablet_mac',
    colorBg: 'bg-surface-container-highest',
    colorText: 'text-on-surface'
  },
  {
    id: 'pizza',
    name: 'Kawałek pizzy',
    subtitle: 'Serowa',
    category: 'food',
    iconName: 'local_pizza',
    colorBg: 'bg-tertiary-fixed/40',
    colorText: 'text-tertiary'
  },
  {
    id: 'mis',
    name: 'Pluszowy miś',
    subtitle: 'Miękki',
    category: 'toys',
    iconName: 'smart_toy',
    colorBg: 'bg-tertiary-container/30',
    colorText: 'text-tertiary'
  },
  {
    id: 'kwiatek',
    name: 'Doniczka',
    subtitle: 'Różowy kwiatek',
    category: 'home',
    iconName: 'potted_plant',
    colorBg: 'bg-secondary-fixed/40',
    colorText: 'text-secondary'
  },
  {
    id: 'ksiazka',
    name: 'Książka bajek',
    subtitle: 'Złote gwiazdy',
    category: 'home',
    iconName: 'menu_book',
    colorBg: 'bg-primary-fixed/40',
    colorText: 'text-primary'
  },
  {
    id: 'lody',
    name: 'Lody malinowe',
    subtitle: 'Chłodzące',
    category: 'food',
    iconName: 'icecream',
    colorBg: 'bg-primary-fixed-dim/40',
    colorText: 'text-primary'
  }
];

export const SKIN_SWATCHES = [
  '#f9c9b0',
  '#f4b294',
  '#d28c68',
  '#9e5d42',
  '#583626',
  '#ffdbac',
  '#ffe0bd',
  '#8d5524'
];

export const HAIR_SWATCHES = [
  '#785a00',
  '#ad2c4f',
  '#006a62',
  '#251a00',
  '#c09732',
  '#ff6b8b',
  '#3b82f6',
  '#8b5cf6',
  '#10b981',
  '#4a2c20'
];

export const OUTFIT_SWATCHES = [
  '#006a62',
  '#ad2c4f',
  '#785a00',
  '#ff6b8b',
  '#70f8e8',
  '#3b82f6',
  '#f59e0b',
  '#ec4899',
  '#10b981',
  '#8b5cf6'
];

export const EMOTIONS_LIST: {
  name: CharacterItem['currentEmotion'];
  icon: string;
  reaction: string;
  color: string;
  defaultAction: 'jump-joy' | 'dance' | 'cheer' | 'surprise' | 'heart-burst' | 'wiggle' | 'sleep' | 'pout';
  quote: string;
}[] = [
  { name: 'Radość', icon: 'sentiment_very_satisfied', reaction: '😊', color: 'text-amber-500', defaultAction: 'jump-joy', quote: 'Hura! Jestem super szczęśliwy! ✨' },
  { name: 'Ekscytacja', icon: 'celebration', reaction: '🤩', color: 'text-pink-500', defaultAction: 'jump-joy', quote: 'Skaczę z radości! Niesamowite! 🎉' },
  { name: 'Taniec', icon: 'nightlife', reaction: '💃', color: 'text-purple-500', defaultAction: 'dance', quote: 'Czas na szalony taniec! 🎶' },
  { name: 'Śmiech', icon: 'mood', reaction: '😆', color: 'text-emerald-500', defaultAction: 'wiggle', quote: 'Haha, to było przezabawne! 🤣' },
  { name: 'Serduszka', icon: 'favorite', reaction: '🥰', color: 'text-rose-500', defaultAction: 'heart-burst', quote: 'Kocham naszych przyjaciół! 💖' },
  { name: 'Zdziwienie', icon: 'sentiment_neutral', reaction: '😮', color: 'text-cyan-500', defaultAction: 'surprise', quote: 'Ooooch! Spójrz na to! 🌟' },
  { name: 'Śpiew', icon: 'music_note', reaction: '🎵', color: 'text-blue-500', defaultAction: 'cheer', quote: 'Tra-la-la! Śpiewamy razem! 🎤' },
  { name: 'Sen', icon: 'bedtime', reaction: '😴', color: 'text-slate-500', defaultAction: 'sleep', quote: 'Zzz... Czas na słodką drzemkę 🌙' },
  { name: 'Złość', icon: 'mood_bad', reaction: '😤', color: 'text-red-500', defaultAction: 'pout', quote: 'Ech, nie zgadzam się z tym! 💢' }
];
