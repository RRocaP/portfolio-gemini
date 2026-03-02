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
      "Combating antimicrobial resistance and advancing gene therapy through computational design and experimental validation.",
  },
  nav: { works: "Works", about: "The Story", contact: "Contact" },
  hero: {
    title: "Bioengineering\nwith AI.",
    subtitle:
      "Combating antimicrobial resistance and advancing gene therapy through computational design and experimental validation.",
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
        "Tailoring capsid-directed evolution technology for improved AAV-mediated CAR-T generation. Published in Molecular Therapy.",
    },
    {
      id: 2,
      title: "Normothermic Liver Perfusion",
      year: "2024",
      tags: ["Preclinical", "AAV", "Translational"],
      blurb:
        "Harnessing whole human liver ex situ normothermic perfusion for preclinical AAV vector evaluation. Published in Nature Comm.",
    },
    {
      id: 3,
      title: "FRG Mouse Model & AAV-LK03",
      year: "2023",
      tags: ["Biodistribution", "Models", "Vectorology"],
      blurb:
        "Characterization of the humanized FRG mouse model and development of an AAV-LK03 variant.",
    },
    {
      id: 4,
      title: "Host Defense Peptides",
      year: "2021",
      tags: ["Antimicrobial", "Nanoclusters", "Peptides"],
      blurb:
        "Antimicrobial potential of Recombinant Host Defense Peptides produced as soluble and nanoclusters.",
    },
    {
      id: 5,
      title: "Multidomain Recombinant Proteins",
      year: "2021",
      tags: ["Immunology", "Proteins", "Engineering"],
      blurb:
        "Sequence edition of single domains modulates the final immune and antimicrobial potential of a new generation of proteins.",
    },
    {
      id: 6,
      title: "High-Quality Protein Conformers",
      year: "2020",
      tags: ["Conformers", "Inclusion Bodies", "Bovine MMP-9"],
      blurb:
        "Selecting Subpopulations of High-Quality Protein Conformers among Conformational Mixtures of Recombinant Proteins.",
    },
  ],
  timeline: [
    {
      year: "2021 - 2026",
      role: "Research Officer",
      company: "Children's Medical Research Institute, Sydney",
      desc: "Built and led a computational peptide discovery platform combining large-scale sequence analysis, protein language models, and GPU pipelines. Designed and experimentally validated over 100 antimicrobial peptide candidates.",
    },
    {
      year: "2016 - 2020",
      role: "Pre-doctoral Researcher",
      company: "UAB & IRTA, Barcelona",
      desc: "Started a new antimicrobial peptide research line from scratch; designed broad-spectrum recombinant proteins, filed 2 patents and published 8 papers.",
    },
    {
      year: "2015 - 2016",
      role: "Graduate Researcher",
      company: "University of California, Irvine",
      desc: "Tracked estrogen receptor dynamics in living cells using single-molecule fluorescence microscopy and quantitative image analysis.",
    },
  ],
  about: {
    heading: "Exploring spaces no bench can cover.",
    bio: [
      "I am a protein engineer by training and a computational scientist out of necessity. I studied Biotechnology in Barcelona, completed a Master's in Biomedical Engineering at UC Irvine, and during my PhD at the UAB, I spent four years designing antimicrobial proteins covering the entire process, from design to production and functional assays. This period yielded two patents and four first-author papers.",
      "Currently, at the CMRI in Sydney, I have developed a platform that analyzes millions of sequences to discover new antimicrobial peptides. I use protein language models to make predictions that we then translate into preclinical models. Additionally, I work on AAV capsid engineering for gene therapy, with research published in journals such as Nature Communications and Molecular Therapy.",
      "Code doesn't kill bacteria. But it tells me where to aim.",
    ],
    competenciesTitle: "Core Competencies",
    competencies: [
      "Protein Language Models",
      "AAV Capsid Engineering",
      "Python & Data Science",
      "Antimicrobial Discovery",
      "GPU-Accelerated Pipelines",
      "Molecular Biology",
    ],
  },
  contact: {
    heading: "Let's connect.",
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
      "Combatiendo la resistencia antimicrobiana y avanzando la terapia génica mediante diseño computacional y validación experimental.",
  },
  nav: { works: "Trabajos", about: "La Historia", contact: "Contacto" },
  hero: {
    title: "Bioingeniería\ncon IA.",
    subtitle:
      "Combatiendo la resistencia antimicrobiana y avanzando la terapia génica mediante diseño computacional y validación experimental.",
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
        "Tecnología de evolución dirigida de cápsides para mejorar la generación de CAR-T mediada por AAV. Publicado en Molecular Therapy.",
    },
    {
      id: 2,
      title: "Perfusión hepática normotérmica",
      year: "2024",
      tags: ["Preclínico", "AAV", "Traslacional"],
      blurb:
        "Perfusión normotérmica ex situ de hígado humano completo para evaluación preclínica de vectores AAV. Publicado en Nature Comm.",
    },
    {
      id: 3,
      title: "Modelo ratón FRG y AAV-LK03",
      year: "2023",
      tags: ["Biodistribución", "Modelos", "Vectorología"],
      blurb:
        "Caracterización del modelo de ratón humanizado FRG y desarrollo de una variante AAV-LK03.",
    },
    {
      id: 4,
      title: "Péptidos de defensa del huésped",
      year: "2021",
      tags: ["Antimicrobiano", "Nanoclústeres", "Péptidos"],
      blurb:
        "Potencial antimicrobiano de péptidos de defensa del huésped recombinantes producidos como solubles y nanoclústeres.",
    },
    {
      id: 5,
      title: "Proteínas recombinantes multidominio",
      year: "2021",
      tags: ["Inmunología", "Proteínas", "Ingeniería"],
      blurb:
        "La edición de secuencias de dominios individuales modula el potencial inmune y antimicrobiano de una nueva generación de proteínas.",
    },
    {
      id: 6,
      title: "Confórmeros proteicos de alta calidad",
      year: "2020",
      tags: ["Confórmeros", "Cuerpos de inclusión", "MMP-9 bovina"],
      blurb:
        "Selección de subpoblaciones de confórmeros proteicos de alta calidad entre mezclas conformacionales de proteínas recombinantes.",
    },
  ],
  timeline: [
    {
      year: "2021 - 2026",
      role: "Investigador",
      company: "Children's Medical Research Institute, Sídney",
      desc: "Construí y lideré una plataforma computacional de descubrimiento de péptidos combinando análisis de secuencias a gran escala, modelos de lenguaje de proteínas y pipelines en GPU. Diseñé y validé experimentalmente más de 100 péptidos antimicrobianos candidatos.",
    },
    {
      year: "2016 - 2020",
      role: "Investigador predoctoral",
      company: "UAB e IRTA, Barcelona",
      desc: "Inicié una nueva línea de investigación de péptidos antimicrobianos desde cero; diseñé proteínas recombinantes de amplio espectro, registré 2 patentes y publiqué 8 artículos.",
    },
    {
      year: "2015 - 2016",
      role: "Investigador de posgrado",
      company: "University of California, Irvine",
      desc: "Rastreé la dinámica del receptor de estrógenos en células vivas usando microscopía de fluorescencia de molécula única y análisis cuantitativo de imagen.",
    },
  ],
  about: {
    heading: "Explorando espacios que ningún laboratorio puede cubrir.",
    bio: [
      "Soy ingeniero de proteínas de formación y científico computacional por necesidad. Me formé en Biotecnología en Barcelona, cursé un máster en Ingeniería Biomédica en la UC Irvine y, durante mi doctorado en la UAB, dediqué cuatro años a diseñar proteínas antimicrobianas abarcando todo el proceso, desde el diseño hasta la producción y el ensayo funcional. Fruto de esta etapa surgieron dos patentes y cuatro artículos como primer autor.",
      "Actualmente, en el CMRI de Sídney, he desarrollado una plataforma que analiza millones de secuencias para descubrir nuevos péptidos antimicrobianos. Utilizo modelos de lenguaje de proteínas para hacer predicciones que luego trasladamos a modelos preclínicos. Además, trabajo en la ingeniería de cápsidas de AAV para terapia génica, con investigaciones publicadas en revistas como Nature Communications y Molecular Therapy.",
      "El código no mata bacterias. Pero me dice dónde apuntar.",
    ],
    competenciesTitle: "Competencias principales",
    competencies: [
      "Modelos de lenguaje de proteínas",
      "Ingeniería de cápsides AAV",
      "Python y ciencia de datos",
      "Descubrimiento antimicrobiano",
      "Pipelines acelerados por GPU",
      "Biología molecular",
    ],
  },
  contact: {
    heading: "Conectemos.",
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
      "Combatent la resistència antimicrobiana i avançant la teràpia gènica mitjançant disseny computacional i validació experimental.",
  },
  nav: { works: "Treballs", about: "La Historia", contact: "Contacte" },
  hero: {
    title: "Bioenginyeria\namb IA.",
    subtitle:
      "Combatent la resistència antimicrobiana i avançant la teràpia gènica mitjançant disseny computacional i validació experimental.",
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
        "Tecnologia d'evolució dirigida de càpsides per millorar la generació de CAR-T mediada per AAV. Publicat a Molecular Therapy.",
    },
    {
      id: 2,
      title: "Perfusió hepàtica normotèrmica",
      year: "2024",
      tags: ["Preclínic", "AAV", "Translacional"],
      blurb:
        "Perfusió normotèrmica ex situ de fetge humà complet per a l'avaluació preclínica de vectors AAV. Publicat a Nature Comm.",
    },
    {
      id: 3,
      title: "Model ratolí FRG i AAV-LK03",
      year: "2023",
      tags: ["Biodistribució", "Models", "Vectorologia"],
      blurb:
        "Caracterització del model de ratolí humanitzat FRG i desenvolupament d'una variant AAV-LK03.",
    },
    {
      id: 4,
      title: "Pèptids de defensa de l'hoste",
      year: "2021",
      tags: ["Antimicrobià", "Nanoclústers", "Pèptids"],
      blurb:
        "Potencial antimicrobià de pèptids de defensa de l'hoste recombinants produïts com a solubles i nanoclústers.",
    },
    {
      id: 5,
      title: "Proteïnes recombinants multidomini",
      year: "2021",
      tags: ["Immunologia", "Proteïnes", "Enginyeria"],
      blurb:
        "L'edició de seqüències de dominis individuals modula el potencial immune i antimicrobià d'una nova generació de proteïnes.",
    },
    {
      id: 6,
      title: "Confòrmers proteics d'alta qualitat",
      year: "2020",
      tags: ["Confòrmers", "Cossos d'inclusió", "MMP-9 bovina"],
      blurb:
        "Selecció de subpoblacions de confòrmers proteics d'alta qualitat entre mescles conformacionals de proteïnes recombinants.",
    },
  ],
  timeline: [
    {
      year: "2021 - 2026",
      role: "Investigador",
      company: "Children's Medical Research Institute, Sydney",
      desc: "Vaig construir i liderar una plataforma computacional de descobriment de pèptids combinant anàlisi de seqüències a gran escala, models de llenguatge de proteïnes i pipelines en GPU. Vaig dissenyar i validar experimentalment més de 100 pèptids antimicrobians candidats.",
    },
    {
      year: "2016 - 2020",
      role: "Investigador predoctoral",
      company: "UAB i IRTA, Barcelona",
      desc: "Vaig iniciar una nova línia de recerca de pèptids antimicrobians des de zero; vaig dissenyar proteïnes recombinants d'ampli espectre, vaig registrar 2 patents i vaig publicar 8 articles.",
    },
    {
      year: "2015 - 2016",
      role: "Investigador de postgrau",
      company: "University of California, Irvine",
      desc: "Vaig rastrejar la dinàmica del receptor d'estrògens en cèl·lules vives usant microscòpia de fluorescència de molècula única i anàlisi quantitativa d'imatge.",
    },
  ],
  about: {
    heading: "Explorant espais que cap laboratori pot cobrir.",
    bio: [
      "Soc enginyer de proteïnes de formació i científic computacional per necessitat. Em vaig formar en Biotecnologia a Barcelona, vaig cursar un màster en Enginyeria Biomèdica a la UC Irvine i, durant el doctorat a la UAB, vaig dedicar quatre anys a dissenyar proteïnes antimicrobianes abastant tot el procés, des del disseny fins a la producció i l'assaig funcional. Fruit d'aquesta etapa van sorgir dues patents i quatre articles com a primer autor.",
      "Actualment, al CMRI de Sydney, he desenvolupat una plataforma que analitza milions de seqüències per descobrir nous pèptids antimicrobians. Faig servir models de llenguatge de proteïnes per fer prediccions que després traslladem a models preclínics. A més, treballo en l'enginyeria de càpsides d'AAV per a teràpia gènica, amb treballs publicats a revistes com Nature Communications i Molecular Therapy.",
      "El codi no mata bacteris. Però em diu on apuntar.",
    ],
    competenciesTitle: "Competències principals",
    competencies: [
      "Models de llenguatge de proteïnes",
      "Enginyeria de càpsides AAV",
      "Python i ciència de dades",
      "Descobriment antimicrobià",
      "Pipelines accelerats per GPU",
      "Biologia molecular",
    ],
  },
  contact: {
    heading: "Connectem.",
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
