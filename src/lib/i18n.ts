export const locales = ["en", "es", "ca"] as const;
export type Locale = (typeof locales)[number];

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export interface WorkItem {
  id: number;
  title: string;
  year: string;
  tags: string[];
  blurb: string;
}

export interface TimelineItem {
  year: string;
  role: string;
  company: string;
  desc: string;
}

export interface Translation {
  meta: { title: string; description: string };
  nav: { works: string; about: string; contact: string };
  hero: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  sections: { works: string; about: string };
  works: WorkItem[];
  timeline: TimelineItem[];
  about: {
    heading: string;
    bio: string[];
    competenciesTitle: string;
    competencies: string[];
  };
  contact: {
    heading: string;
    subtitle: string;
    emailLabel: string;
    footer: string;
  };
  audio: { mute: string; unmute: string };
  mobileMenu: { open: string; close: string };
}

const en: Translation = {
  meta: {
    title: "Ramon Roca Pinilla — Biomedical Engineer",
    description:
      "From protein language models to mouse models. Antimicrobial discovery and gene therapy.",
  },
  nav: { works: "Works", about: "The Story", contact: "Contact" },
  hero: {
    title: "Dreaming up proteins in silico.\nProving them in the lab.",
    subtitle:
      "From protein language models to mouse models. Antimicrobial discovery and gene therapy.",
    ctaPrimary: "View Publications",
    ctaSecondary: "The Story",
  },
  sections: { works: "01. Selected Works", about: "02. The Story" },
  works: [
    {
      id: 1,
      title: "AAV-mediated CAR-T generation",
      year: "2024",
      tags: ["Capsid Evolution", "AAV", "Gene Therapy"],
      blurb:
        "Engineered AAV capsids for CAR-T cell generation. Molecular Therapy, 2024.",
    },
    {
      id: 2,
      title: "Normothermic Liver Perfusion",
      year: "2024",
      tags: ["Preclinical", "AAV", "Translational"],
      blurb:
        "Used ex situ liver perfusion to evaluate AAV vectors preclinically. Nature Communications, 2024.",
    },
    {
      id: 3,
      title: "FRG Mouse Model & AAV-LK03",
      year: "2023",
      tags: ["Biodistribution", "Models", "Vectorology"],
      blurb:
        "Characterized the humanized FRG mouse model and developed an AAV-LK03 variant. 2023.",
    },
    {
      id: 4,
      title: "Host Defense Peptides",
      year: "2021",
      tags: ["Antimicrobial", "Nanoclusters", "Peptides"],
      blurb:
        "Produced recombinant host defense peptides as soluble proteins and nanoclusters. 2021.",
    },
    {
      id: 5,
      title: "Multidomain Recombinant Proteins",
      year: "2021",
      tags: ["Immunology", "Proteins", "Engineering"],
      blurb:
        "Engineered multidomain proteins with tuned immune and antimicrobial activity. 2021.",
    },
    {
      id: 6,
      title: "High-Quality Protein Conformers",
      year: "2020",
      tags: ["Conformers", "Inclusion Bodies", "Bovine MMP-9"],
      blurb:
        "Selected high-quality protein conformers from recombinant inclusion body mixtures. 2020.",
    },
  ],
  timeline: [
    {
      year: "2021 - 2026",
      role: "Research Officer",
      company: "Children's Medical Research Institute, Sydney",
      desc: "Developed a computational platform for antimicrobial peptide discovery — from protein language model predictions to preclinical validation in mouse models. Also worked on AAV capsid engineering for gene therapy.",
    },
    {
      year: "2016 - 2020",
      role: "Pre-doctoral Researcher",
      company: "UAB & IRTA, Barcelona",
      desc: "Designed antimicrobial proteins from scratch — cloning, recombinant production, functional assays. Two patents, four first-author papers, eight total.",
    },
    {
      year: "2015 - 2016",
      role: "Graduate Researcher",
      company: "University of California, Irvine",
      desc: "Tracked estrogen receptor dynamics in living cells using single-molecule fluorescence microscopy and quantitative image analysis.",
    },
  ],
  about: {
    heading: "Finding the therapeutic signal in a sea of biological noise.",
    bio: [
      "I am a protein engineer by training and a computational scientist out of necessity. I studied Biotechnology in Barcelona, completed a Master's in Biomedical Engineering at UC Irvine, and during my PhD at the UAB, I spent four years designing antimicrobial proteins covering the entire process, from design to production and functional assays. This period yielded two patents and four first-author papers.",
      "At the CMRI in Sydney, I developed a platform that mines millions of sequences to find new antimicrobial peptides. I used protein language models to predict activity and translated that into preclinical models. I also engineered AAV capsids for gene therapy — Nature Communications, Molecular Therapy.",
    ],
    competenciesTitle: "Core Competencies",
    competencies: [
      "Protein Language Models",
      "AAV Capsid Engineering",
      "Python & Data Science",
      "Antimicrobial Discovery",
      "Preclinical Validation",
      "Molecular Biology",
    ],
  },
  contact: {
    heading: "Code doesn't kill bacteria. But it tells me where to aim.",
    subtitle:
      "Bridging computation and biology. 20+ publications, 300+ citations, and 2 patents in antimicrobial drug discovery and protein engineering.",
    emailLabel: "ramon.rocap@gmail.com",
    footer: "All rights reserved.",
  },
  audio: {
    mute: "Mute immersive soundscape",
    unmute: "Unmute immersive soundscape",
  },
  mobileMenu: { open: "Open menu", close: "Close menu" },
};

const es: Translation = {
  meta: {
    title: "Ramon Roca Pinilla — Ingeniero Biomédico",
    description:
      "De modelos de lenguaje de proteínas a modelos in vivo. Descubrimiento antimicrobiano y terapia génica.",
  },
  nav: { works: "Trabajos", about: "La Historia", contact: "Contacto" },
  hero: {
    title: "Soñando proteínas in silico.\nDemostrándolas en el laboratorio.",
    subtitle:
      "De modelos de lenguaje de proteínas a modelos in vivo. Descubrimiento antimicrobiano y terapia génica.",
    ctaPrimary: "Ver publicaciones",
    ctaSecondary: "La historia",
  },
  sections: { works: "01. Trabajos seleccionados", about: "02. La historia" },
  works: [
    {
      id: 1,
      title: "Generación de CAR-T mediada por AAV",
      year: "2024",
      tags: ["Evolución de cápsides", "AAV", "Terapia génica"],
      blurb:
        "Ingeniería de cápsidas de AAV para la generación de células CAR-T. Molecular Therapy, 2024.",
    },
    {
      id: 2,
      title: "Perfusión hepática normotérmica",
      year: "2024",
      tags: ["Preclínico", "AAV", "Traslacional"],
      blurb:
        "Perfusión hepática ex situ para evaluar vectores AAV preclínicamente. Nature Communications, 2024.",
    },
    {
      id: 3,
      title: "Modelo ratón FRG y AAV-LK03",
      year: "2023",
      tags: ["Biodistribución", "Modelos", "Vectorología"],
      blurb:
        "Caracterización del modelo de ratón humanizado FRG y desarrollo de una variante AAV-LK03. 2023.",
    },
    {
      id: 4,
      title: "Péptidos de defensa del huésped",
      year: "2021",
      tags: ["Antimicrobiano", "Nanoclústeres", "Péptidos"],
      blurb:
        "Producción de péptidos de defensa del huésped recombinantes como proteínas solubles y nanoclústeres. 2021.",
    },
    {
      id: 5,
      title: "Proteínas recombinantes multidominio",
      year: "2021",
      tags: ["Inmunología", "Proteínas", "Ingeniería"],
      blurb:
        "Ingeniería de proteínas multidominio con actividad inmune y antimicrobiana modulada. 2021.",
    },
    {
      id: 6,
      title: "Confórmeros proteicos de alta calidad",
      year: "2020",
      tags: ["Confórmeros", "Cuerpos de inclusión", "MMP-9 bovina"],
      blurb:
        "Selección de confórmeros proteicos de alta calidad a partir de mezclas de cuerpos de inclusión recombinantes. 2020.",
    },
  ],
  timeline: [
    {
      year: "2021 - 2026",
      role: "Investigador",
      company: "Children's Medical Research Institute, Sídney",
      desc: "Desarrollé una plataforma computacional para el descubrimiento de péptidos antimicrobianos — de predicciones con modelos de lenguaje de proteínas a validación preclínica en modelos de ratón. También trabajé en ingeniería de cápsidas de AAV para terapia génica.",
    },
    {
      year: "2016 - 2020",
      role: "Investigador predoctoral",
      company: "UAB e IRTA, Barcelona",
      desc: "Diseñé proteínas antimicrobianas desde cero — clonaje, producción recombinante, ensayos funcionales. Dos patentes, cuatro artículos como primer autor, ocho en total.",
    },
    {
      year: "2015 - 2016",
      role: "Investigador de posgrado",
      company: "University of California, Irvine",
      desc: "Rastreé la dinámica del receptor de estrógenos en células vivas usando microscopía de fluorescencia de molécula única y análisis cuantitativo de imagen.",
    },
  ],
  about: {
    heading: "Encontrando la señal terapéutica en un mar de ruido biológico.",
    bio: [
      "Soy ingeniero de proteínas de formación y científico computacional por necesidad. Me formé en Biotecnología en Barcelona, cursé un máster en Ingeniería Biomédica en la UC Irvine y, durante mi doctorado en la UAB, dediqué cuatro años a diseñar proteínas antimicrobianas abarcando todo el proceso, desde el diseño hasta la producción y el ensayo funcional. Fruto de esta etapa surgieron dos patentes y cuatro artículos como primer autor.",
      "En el CMRI de Sídney, desarrollé una plataforma que mina millones de secuencias para encontrar nuevos péptidos antimicrobianos. Usé modelos de lenguaje de proteínas para predecir actividad y lo trasladé a modelos preclínicos. También hice ingeniería de cápsidas de AAV para terapia génica — Nature Communications, Molecular Therapy.",
    ],
    competenciesTitle: "Competencias principales",
    competencies: [
      "Modelos de lenguaje de proteínas",
      "Ingeniería de cápsides AAV",
      "Python y ciencia de datos",
      "Descubrimiento antimicrobiano",
      "Validación preclínica",
      "Biología molecular",
    ],
  },
  contact: {
    heading: "El código no mata bacterias. Pero me dice dónde apuntar.",
    subtitle:
      "Uniendo computación y biología. 20+ publicaciones, 300+ citas y 2 patentes en descubrimiento de fármacos antimicrobianos e ingeniería de proteínas.",
    emailLabel: "ramon.rocap@gmail.com",
    footer: "Todos los derechos reservados.",
  },
  audio: {
    mute: "Silenciar paisaje sonoro",
    unmute: "Activar paisaje sonoro",
  },
  mobileMenu: { open: "Abrir menú", close: "Cerrar menú" },
};

const ca: Translation = {
  meta: {
    title: "Ramon Roca Pinilla — Enginyer Biomèdic",
    description:
      "De models de llenguatge de proteïnes a models in vivo. Descobriment antimicrobià i teràpia gènica.",
  },
  nav: { works: "Treballs", about: "La Història", contact: "Contacte" },
  hero: {
    title: "Somiant proteïnes in silico.\nDemostrant-les al laboratori.",
    subtitle:
      "De models de llenguatge de proteïnes a models in vivo. Descobriment antimicrobià i teràpia gènica.",
    ctaPrimary: "Veure publicacions",
    ctaSecondary: "La història",
  },
  sections: { works: "01. Treballs seleccionats", about: "02. La història" },
  works: [
    {
      id: 1,
      title: "Generació de CAR-T mediada per AAV",
      year: "2024",
      tags: ["Evolució de càpsides", "AAV", "Teràpia gènica"],
      blurb:
        "Enginyeria de càpsides d'AAV per a la generació de cèl·lules CAR-T. Molecular Therapy, 2024.",
    },
    {
      id: 2,
      title: "Perfusió hepàtica normotèrmica",
      year: "2024",
      tags: ["Preclínic", "AAV", "Translacional"],
      blurb:
        "Perfusió hepàtica ex situ per avaluar vectors AAV preclínicament. Nature Communications, 2024.",
    },
    {
      id: 3,
      title: "Model ratolí FRG i AAV-LK03",
      year: "2023",
      tags: ["Biodistribució", "Models", "Vectorologia"],
      blurb:
        "Caracterització del model de ratolí humanitzat FRG i desenvolupament d'una variant AAV-LK03. 2023.",
    },
    {
      id: 4,
      title: "Pèptids de defensa de l'hoste",
      year: "2021",
      tags: ["Antimicrobià", "Nanoclústers", "Pèptids"],
      blurb:
        "Producció de pèptids de defensa de l'hoste recombinants com a proteïnes solubles i nanoclústers. 2021.",
    },
    {
      id: 5,
      title: "Proteïnes recombinants multidomini",
      year: "2021",
      tags: ["Immunologia", "Proteïnes", "Enginyeria"],
      blurb:
        "Enginyeria de proteïnes multidomini amb activitat immune i antimicrobiana modulada. 2021.",
    },
    {
      id: 6,
      title: "Confòrmers proteics d'alta qualitat",
      year: "2020",
      tags: ["Confòrmers", "Cossos d'inclusió", "MMP-9 bovina"],
      blurb:
        "Selecció de confòrmers proteics d'alta qualitat a partir de mescles de cossos d'inclusió recombinants. 2020.",
    },
  ],
  timeline: [
    {
      year: "2021 - 2026",
      role: "Investigador",
      company: "Children's Medical Research Institute, Sydney",
      desc: "Vaig desenvolupar una plataforma computacional per al descobriment de pèptids antimicrobians — de prediccions amb models de llenguatge de proteïnes a validació preclínica en models de ratolí. També vaig treballar en enginyeria de càpsides d'AAV per a teràpia gènica.",
    },
    {
      year: "2016 - 2020",
      role: "Investigador predoctoral",
      company: "UAB i IRTA, Barcelona",
      desc: "Vaig dissenyar proteïnes antimicrobianes des de zero — clonatge, producció recombinant, assajos funcionals. Dues patents, quatre articles com a primer autor, vuit en total.",
    },
    {
      year: "2015 - 2016",
      role: "Investigador de postgrau",
      company: "University of California, Irvine",
      desc: "Vaig rastrejar la dinàmica del receptor d'estrògens en cèl·lules vives usant microscòpia de fluorescència de molècula única i anàlisi quantitativa d'imatge.",
    },
  ],
  about: {
    heading: "Trobant el senyal terapèutic en un mar de soroll biològic.",
    bio: [
      "Sóc enginyer de proteïnes de formació i científic computacional per necessitat. Em vaig formar en Biotecnologia a Barcelona, vaig fer un màster en Enginyeria Biomèdica a la UC Irvine, i durant el doctorat a la UAB vaig dedicar quatre anys a dissenyar proteïnes antimicrobianes — des del disseny fins a la producció i l'assaig funcional. D'allà en surten dues patents i quatre articles com a primer autor.",
      "A Sydney, al CMRI, vaig muntar una plataforma que mina milions de seqüències per trobar pèptids antimicrobians nous. Vaig fer servir models de llenguatge de proteïnes per predir i acabar-ho traduint en models preclínics. També vaig fer enginyeria de càpsides d'AAV per a teràpia gènica — Nature Communications, Molecular Therapy.",
    ],
    competenciesTitle: "Competències principals",
    competencies: [
      "Models de llenguatge de proteïnes",
      "Enginyeria de càpsides AAV",
      "Python i ciència de dades",
      "Descobriment antimicrobià",
      "Validació preclínica",
      "Biologia molecular",
    ],
  },
  contact: {
    heading: "El codi no mata bacteris. Però em diu on apuntar.",
    subtitle:
      "Unint computació i biologia. 20+ publicacions, 300+ citacions i 2 patents en descobriment de fàrmacs antimicrobians i enginyeria de proteïnes.",
    emailLabel: "ramon.rocap@gmail.com",
    footer: "Tots els drets reservats.",
  },
  audio: {
    mute: "Silenciar paisatge sonor",
    unmute: "Activar paisatge sonor",
  },
  mobileMenu: { open: "Obrir menú", close: "Tancar menú" },
};

export const translations: Record<Locale, Translation> = { en, es, ca };
