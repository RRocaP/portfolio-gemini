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
  nav: { works: string; about: string; writing: string; contact: string };
  hero: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scroll: string;
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
  nav: { works: "Works", about: "About", writing: "Writing", contact: "Contact" },
  hero: {
    title: "Engineering proteins\nand viral vectors.",
    subtitle:
      "Combating antimicrobial resistance and advancing gene therapy through computational design and experimental validation.",
    ctaPrimary: "View Publications",
    ctaSecondary: "The Story",
    scroll: "Scroll",
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
      "My background spans from a Biotechnology degree in Barcelona to a Masters in Biomedical Engineering at UC Irvine. During my PhD, I spent four years on multidomain antimicrobial protein design, leading to two patents.",
      "At the Children's Medical Research Institute (CMRI) in Sydney, I built and led a computational peptide discovery platform. I combined large-scale sequence analysis, protein language models, and GPU-accelerated pipelines to design and experimentally validate over 100 antimicrobial peptide candidates.",
      "I also contributed heavily to AAV capsid engineering and directed evolution for gene therapies. I don't use computation as a replacement for the bench, but to explore spaces and sequences that no bench can cover alone.",
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
    heading: "Exploring spaces no bench can cover.",
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
  nav: { works: "Trabajos", about: "Sobre mí", writing: "Escritos", contact: "Contacto" },
  hero: {
    title: "Diseñando proteínas\ny vectores virales.",
    subtitle:
      "Combatiendo la resistencia antimicrobiana y avanzando la terapia génica mediante diseño computacional y validación experimental.",
    ctaPrimary: "Ver publicaciones",
    ctaSecondary: "La historia",
    scroll: "Desplazar",
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
      "Mi formación abarca desde un grado en Biotecnología en Barcelona hasta un máster en Ingeniería Biomédica en UC Irvine. Durante mi doctorado, dediqué cuatro años al diseño de proteínas antimicrobianas multidominio, lo que resultó en dos patentes.",
      "En el Children's Medical Research Institute (CMRI) en Sídney, construí y lideré una plataforma computacional de descubrimiento de péptidos. Combiné análisis de secuencias a gran escala, modelos de lenguaje de proteínas y pipelines acelerados por GPU para diseñar y validar experimentalmente más de 100 péptidos antimicrobianos candidatos.",
      "También contribuí significativamente a la ingeniería de cápsides de AAV y evolución dirigida para terapias génicas. No uso la computación como sustituto del laboratorio, sino para explorar espacios y secuencias que ningún laboratorio puede cubrir por sí solo.",
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
    heading: "Explorando espacios que ningún laboratorio puede cubrir.",
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
  nav: { works: "Treballs", about: "Sobre mi", writing: "Escrits", contact: "Contacte" },
  hero: {
    title: "Dissenyant proteïnes\ni vectors virals.",
    subtitle:
      "Combatent la resistència antimicrobiana i avançant la teràpia gènica mitjançant disseny computacional i validació experimental.",
    ctaPrimary: "Veure publicacions",
    ctaSecondary: "La història",
    scroll: "Desplaçar",
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
      "La meva formació abasta des d'un grau en Biotecnologia a Barcelona fins a un màster en Enginyeria Biomèdica a UC Irvine. Durant el meu doctorat, vaig dedicar quatre anys al disseny de proteïnes antimicrobianes multidomini, el que va resultar en dues patents.",
      "Al Children's Medical Research Institute (CMRI) a Sydney, vaig construir i liderar una plataforma computacional de descobriment de pèptids. Vaig combinar anàlisi de seqüències a gran escala, models de llenguatge de proteïnes i pipelines accelerats per GPU per dissenyar i validar experimentalment més de 100 pèptids antimicrobians candidats.",
      "També vaig contribuir significativament a l'enginyeria de càpsides d'AAV i evolució dirigida per a teràpies gèniques. No faig servir la computació com a substitut del laboratori, sinó per explorar espais i seqüències que cap laboratori pot cobrir per si sol.",
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
    heading: "Explorant espais que cap laboratori pot cobrir.",
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
