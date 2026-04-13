// ============================================================
// lib/wilayas.ts — Liste des 58 wilayas d'Algérie
// Utilisé dans le formulaire COD et les filtres admin
// ============================================================

export type Wilaya = {
  code: number   // Code officiel (01 à 58)
  nom_fr: string
  nom_ar: string
}

export const WILAYAS: Wilaya[] = [
  { code: 1,  nom_fr: 'Adrar',             nom_ar: 'أدرار' },
  { code: 2,  nom_fr: 'Chlef',             nom_ar: 'الشلف' },
  { code: 3,  nom_fr: 'Laghouat',          nom_ar: 'الأغواط' },
  { code: 4,  nom_fr: 'Oum El Bouaghi',    nom_ar: 'أم البواقي' },
  { code: 5,  nom_fr: 'Batna',             nom_ar: 'باتنة' },
  { code: 6,  nom_fr: 'Béjaïa',            nom_ar: 'بجاية' },
  { code: 7,  nom_fr: 'Biskra',            nom_ar: 'بسكرة' },
  { code: 8,  nom_fr: 'Béchar',            nom_ar: 'بشار' },
  { code: 9,  nom_fr: 'Blida',             nom_ar: 'البليدة' },
  { code: 10, nom_fr: 'Bouira',            nom_ar: 'البويرة' },
  { code: 11, nom_fr: 'Tamanrasset',       nom_ar: 'تمنراست' },
  { code: 12, nom_fr: 'Tébessa',           nom_ar: 'تبسة' },
  { code: 13, nom_fr: 'Tlemcen',           nom_ar: 'تلمسان' },
  { code: 14, nom_fr: 'Tiaret',            nom_ar: 'تيارت' },
  { code: 15, nom_fr: 'Tizi Ouzou',        nom_ar: 'تيزي وزو' },
  { code: 16, nom_fr: 'Alger',             nom_ar: 'الجزائر' },
  { code: 17, nom_fr: 'Djelfa',            nom_ar: 'الجلفة' },
  { code: 18, nom_fr: 'Jijel',             nom_ar: 'جيجل' },
  { code: 19, nom_fr: 'Sétif',             nom_ar: 'سطيف' },
  { code: 20, nom_fr: 'Saïda',             nom_ar: 'سعيدة' },
  { code: 21, nom_fr: 'Skikda',            nom_ar: 'سكيكدة' },
  { code: 22, nom_fr: 'Sidi Bel Abbès',    nom_ar: 'سيدي بلعباس' },
  { code: 23, nom_fr: 'Annaba',            nom_ar: 'عنابة' },
  { code: 24, nom_fr: 'Guelma',            nom_ar: 'قالمة' },
  { code: 25, nom_fr: 'Constantine',       nom_ar: 'قسنطينة' },
  { code: 26, nom_fr: 'Médéa',             nom_ar: 'المدية' },
  { code: 27, nom_fr: 'Mostaganem',        nom_ar: 'مستغانم' },
  { code: 28, nom_fr: 'M\'Sila',           nom_ar: 'المسيلة' },
  { code: 29, nom_fr: 'Mascara',           nom_ar: 'معسكر' },
  { code: 30, nom_fr: 'Ouargla',           nom_ar: 'ورقلة' },
  { code: 31, nom_fr: 'Oran',              nom_ar: 'وهران' },
  { code: 32, nom_fr: 'El Bayadh',         nom_ar: 'البيض' },
  { code: 33, nom_fr: 'Illizi',            nom_ar: 'إليزي' },
  { code: 34, nom_fr: 'Bordj Bou Arréridj', nom_ar: 'برج بوعريريج' },
  { code: 35, nom_fr: 'Boumerdès',         nom_ar: 'بومرداس' },
  { code: 36, nom_fr: 'El Tarf',           nom_ar: 'الطارف' },
  { code: 37, nom_fr: 'Tindouf',           nom_ar: 'تندوف' },
  { code: 38, nom_fr: 'Tissemsilt',        nom_ar: 'تيسمسيلت' },
  { code: 39, nom_fr: 'El Oued',           nom_ar: 'الوادي' },
  { code: 40, nom_fr: 'Khenchela',         nom_ar: 'خنشلة' },
  { code: 41, nom_fr: 'Souk Ahras',        nom_ar: 'سوق أهراس' },
  { code: 42, nom_fr: 'Tipaza',            nom_ar: 'تيبازة' },
  { code: 43, nom_fr: 'Mila',              nom_ar: 'ميلة' },
  { code: 44, nom_fr: 'Aïn Defla',         nom_ar: 'عين الدفلى' },
  { code: 45, nom_fr: 'Naâma',             nom_ar: 'النعامة' },
  { code: 46, nom_fr: 'Aïn Témouchent',    nom_ar: 'عين تموشنت' },
  { code: 47, nom_fr: 'Ghardaïa',          nom_ar: 'غرداية' },
  { code: 48, nom_fr: 'Relizane',          nom_ar: 'غليزان' },
  { code: 49, nom_fr: 'Timimoun',          nom_ar: 'تيميمون' },
  { code: 50, nom_fr: 'Bordj Badji Mokhtar', nom_ar: 'برج باجي مختار' },
  { code: 51, nom_fr: 'Ouled Djellal',     nom_ar: 'أولاد جلال' },
  { code: 52, nom_fr: 'Béni Abbès',        nom_ar: 'بني عباس' },
  { code: 53, nom_fr: 'In Salah',          nom_ar: 'عين صالح' },
  { code: 54, nom_fr: 'In Guezzam',        nom_ar: 'عين قزام' },
  { code: 55, nom_fr: 'Touggourt',         nom_ar: 'تقرت' },
  { code: 56, nom_fr: 'Djanet',            nom_ar: 'جانت' },
  { code: 57, nom_fr: 'El M\'Ghair',       nom_ar: 'المغير' },
  { code: 58, nom_fr: 'El Meniaa',         nom_ar: 'المنيعة' },
]

// Noms FR uniquement — pour le select du formulaire et les filtres admin
export const WILAYA_NOMS_FR: string[] = WILAYAS.map((w) => w.nom_fr)

// Vérifier si une wilaya est valide (utilisé dans la validation API)
export function isWilayaValide(nom: string): boolean {
  return WILAYAS.some(
    (w) => w.nom_fr === nom || w.nom_ar === nom
  )
}
