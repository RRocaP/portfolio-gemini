export const locales = ["en", "es", "ca"] as const;
export type Locale = (typeof locales)[number];

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export interface WorkItem {
  id: number;
  title: string;
  year: string;
  venue: string;
  tags: string[];
  blurb: string;
  href: string;
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
    eyebrow: string;
    title: string;
    subtitle: string;
    supportingLine: string;
    ctaPrimary: string;
    ctaSecondary: string;
    proof: string[];
  };
  sections: { works: string; about: string };
  works: WorkItem[];
  workLinkLabel: string;
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
    title: "Ramon Roca Pinilla - Biomedical Engineer",
    description:
      "Protein engineering from computational design to preclinical validation, spanning antimicrobial discovery and gene therapy.",
  },
  nav: { works: "Works", about: "The Story", contact: "Contact" },
  hero: {
    eyebrow:
      "Biomedical Engineer | Protein Engineering | Antimicrobial Discovery | Gene Therapy",
    title: "Protein engineering from computational design to preclinical validation.",
    subtitle:
      "I design and validate proteins for antimicrobial discovery and gene therapy, translating sequence-level ideas into experimental proof.",
    supportingLine: "From protein language models to mouse models.",
    ctaPrimary: "Selected Work",
    ctaSecondary: "The Story",
    proof: [
      "Research Officer, CMRI Sydney",
      "20+ publications",
      "300+ citations",
      "2 patents",
    ],
  },
  sections: { works: "01. Selected Work", about: "02. The Story" },
  works: [
    {
      id: 1,
      title: "AAV-mediated CAR-T generation",
      year: "2024",
      venue: "Molecular Therapy",
      tags: ["Capsid Evolution", "AAV", "Gene Therapy"],
      blurb:
        "Evolved AAV capsids that improved targeted CAR-T generation and reduced the vector dose needed for primary T cell editing.",
      href: "https://doi.org/10.1016/j.ymthe.2024.12.012",
    },
    {
      id: 2,
      title: "Normothermic Liver Perfusion",
      year: "2024",
      venue: "Nature Communications",
      tags: ["Preclinical", "AAV", "Translational"],
      blurb:
        "Used whole human liver perfusion to compare AAV vectors in a clinically relevant preclinical model.",
      href: "https://doi.org/10.1038/s41467-024-46194-y",
    },
    {
      id: 3,
      title: "FRG Mouse Model & AAV-LK03",
      year: "2023",
      venue: "Molecular Therapy Methods & Clinical Development",
      tags: ["Biodistribution", "Models", "Vectorology"],
      blurb:
        "Characterized the humanized FRG mouse model and developed an AAV-LK03 variant with improved liver lobular biodistribution.",
      href: "https://doi.org/10.1016/j.omtm.2022.12.014",
    },
    {
      id: 4,
      title: "Host Defense Peptides",
      year: "2022",
      venue: "Microbial Cell Factories",
      tags: ["Antimicrobial", "Peptides", "Translation"],
      blurb:
        "Reviewed how recombinant host defense peptides can be engineered and produced for antimicrobial translation at scale.",
      href: "https://doi.org/10.1186/s12934-022-01991-2",
    },
    {
      id: 5,
      title: "Multidomain Recombinant Proteins",
      year: "2020",
      venue: "Microbial Cell Factories",
      tags: ["Immunology", "Proteins", "Engineering"],
      blurb:
        "Built multidomain recombinant proteins with broad antimicrobial activity in soluble and nanocluster formats.",
      href: "https://doi.org/10.1186/s12934-020-01380-7",
    },
    {
      id: 6,
      title: "High-Quality Protein Conformers",
      year: "2021",
      venue: "International Journal of Molecular Sciences",
      tags: ["Conformers", "Inclusion Bodies", "Bovine MMP-9"],
      blurb:
        "Selected higher-quality protein conformers from recombinant inclusion body mixtures to improve activity and stability.",
      href: "https://doi.org/10.3390/ijms22063020",
    },
  ],
  workLinkLabel: "Read paper",
  timeline: [
    {
      year: "2021 - 2026",
      role: "Research Officer",
      company: "Children's Medical Research Institute, Sydney",
      desc: "Developed a computational platform for antimicrobial peptide discovery - from protein language model predictions to preclinical validation in mouse models. Also worked on AAV capsid engineering for gene therapy.",
    },
    {
      year: "2016 - 2020",
      role: "Pre-doctoral Researcher",
      company: "UAB & IRTA, Barcelona",
      desc: "Designed antimicrobial proteins from scratch - cloning, recombinant production, functional assays. Two patents, four first-author papers, eight total.",
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
      "At the CMRI in Sydney, I developed a platform that mines millions of sequences to find new antimicrobial peptides. I used protein language models to predict activity and translated that into preclinical models. I also engineered AAV capsids for gene therapy - Nature Communications, Molecular Therapy.",
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
    title: "Ramon Roca Pinilla - Ingeniero Biomédico",
    description:
      "Ingeniería de proteínas desde el diseño computacional hasta la validación preclínica, entre el descubrimiento antimicrobiano y la terapia génica.",
  },
  nav: { works: "Trabajos", about: "La Historia", contact: "Contacto" },
  hero: {
    eyebrow:
      "Ingeniería biomédica | Ingeniería de proteínas | Descubrimiento antimicrobiano | Terapia génica",
    title:
      "Ingeniería de proteínas desde el diseño computacional hasta la validación preclínica.",
    subtitle:
      "Diseño y valido proteínas para descubrimiento antimicrobiano y terapia génica, traduciendo ideas a nivel de secuencia en evidencia experimental.",
    supportingLine: "De modelos de lenguaje de proteínas a modelos de ratón.",
    ctaPrimary: "Trabajos",
    ctaSecondary: "La historia",
    proof: [
      "Investigador, CMRI Sídney",
      "20+ publicaciones",
      "300+ citas",
      "2 patentes",
    ],
  },
  sections: { works: "01. Trabajos seleccionados", about: "02. La historia" },
  works: [
    {
      id: 1,
      title: "Generación de CAR-T mediada por AAV",
      year: "2024",
      venue: "Molecular Therapy",
      tags: ["Evolución de cápsides", "AAV", "Terapia génica"],
      blurb:
        "Evolucioné cápsidas AAV que mejoraron la generación dirigida de CAR-T y redujeron la dosis vectorial necesaria en edición de linfocitos T primarios.",
      href: "https://doi.org/10.1016/j.ymthe.2024.12.012",
    },
    {
      id: 2,
      title: "Perfusión hepática normotérmica",
      year: "2024",
      venue: "Nature Communications",
      tags: ["Preclínico", "AAV", "Traslacional"],
      blurb:
        "Usé perfusión de hígado humano completo para comparar vectores AAV en un modelo preclínico con relevancia clínica.",
      href: "https://doi.org/10.1038/s41467-024-46194-y",
    },
    {
      id: 3,
      title: "Modelo ratón FRG y AAV-LK03",
      year: "2023",
      venue: "Molecular Therapy Methods & Clinical Development",
      tags: ["Biodistribución", "Modelos", "Vectorología"],
      blurb:
        "Caractericé el modelo de ratón humanizado FRG y desarrollé una variante de AAV-LK03 con mejor biodistribución lobulillar hepática.",
      href: "https://doi.org/10.1016/j.omtm.2022.12.014",
    },
    {
      id: 4,
      title: "Péptidos de defensa del huésped",
      year: "2022",
      venue: "Microbial Cell Factories",
      tags: ["Antimicrobiano", "Péptidos", "Traslación"],
      blurb:
        "Revisé cómo los péptidos recombinantes de defensa del huésped pueden diseñarse y producirse para trasladarlos a terapias antimicrobianas.",
      href: "https://doi.org/10.1186/s12934-022-01991-2",
    },
    {
      id: 5,
      title: "Proteínas recombinantes multidominio",
      year: "2020",
      venue: "Microbial Cell Factories",
      tags: ["Inmunología", "Proteínas", "Ingeniería"],
      blurb:
        "Construí proteínas recombinantes multidominio con actividad antimicrobiana de amplio espectro en formatos soluble y nanocluster.",
      href: "https://doi.org/10.1186/s12934-020-01380-7",
    },
    {
      id: 6,
      title: "Confórmeros proteicos de alta calidad",
      year: "2021",
      venue: "International Journal of Molecular Sciences",
      tags: ["Confórmeros", "Cuerpos de inclusión", "MMP-9 bovina"],
      blurb:
        "Seleccioné confórmeros proteicos de mayor calidad a partir de mezclas recombinantes de cuerpos de inclusión para mejorar actividad y estabilidad.",
      href: "https://doi.org/10.3390/ijms22063020",
    },
  ],
  workLinkLabel: "Ver artículo",
  timeline: [
    {
      year: "2021 - 2026",
      role: "Investigador",
      company: "Children's Medical Research Institute, Sídney",
      desc: "Desarrollé una plataforma computacional para el descubrimiento de péptidos antimicrobianos - de predicciones con modelos de lenguaje de proteínas a validación preclínica en modelos de ratón. También trabajé en ingeniería de cápsidas de AAV para terapia génica.",
    },
    {
      year: "2016 - 2020",
      role: "Investigador predoctoral",
      company: "UAB e IRTA, Barcelona",
      desc: "Diseñé proteínas antimicrobianas desde cero - clonaje, producción recombinante, ensayos funcionales. Dos patentes, cuatro artículos como primer autor, ocho en total.",
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
      "En el CMRI de Sídney, desarrollé una plataforma que mina millones de secuencias para encontrar nuevos péptidos antimicrobianos. Usé modelos de lenguaje de proteínas para predecir actividad y lo trasladé a modelos preclínicos. También hice ingeniería de cápsidas de AAV para terapia génica - Nature Communications, Molecular Therapy.",
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
    title: "Ramon Roca Pinilla - Enginyer Biomèdic",
    description:
      "Enginyeria de proteïnes des del disseny computacional fins a la validació preclínica, entre el descobriment antimicrobià i la teràpia gènica.",
  },
  nav: { works: "Treballs", about: "La Història", contact: "Contacte" },
  hero: {
    eyebrow:
      "Enginyeria biomèdica | Enginyeria de proteïnes | Descobriment antimicrobià | Teràpia gènica",
    title:
      "Enginyeria de proteïnes des del disseny computacional fins a la validació preclínica.",
    subtitle:
      "Dissenyo i valido proteïnes per al descobriment antimicrobià i la teràpia gènica, traduint idees a nivell de seqüència en evidència experimental.",
    supportingLine: "De models de llenguatge de proteïnes a models de ratolí.",
    ctaPrimary: "Treballs",
    ctaSecondary: "La història",
    proof: [
      "Investigador, CMRI Sydney",
      "20+ publicacions",
      "300+ citacions",
      "2 patents",
    ],
  },
  sections: { works: "01. Treballs seleccionats", about: "02. La història" },
  works: [
    {
      id: 1,
      title: "Generació de CAR-T mediada per AAV",
      year: "2024",
      venue: "Molecular Therapy",
      tags: ["Evolució de càpsides", "AAV", "Teràpia gènica"],
      blurb:
        "Vaig evolucionar càpsides AAV que milloraven la generació dirigida de CAR-T i reduïen la dosi vectorial necessària en l'edició de limfòcits T primaris.",
      href: "https://doi.org/10.1016/j.ymthe.2024.12.012",
    },
    {
      id: 2,
      title: "Perfusió hepàtica normotèrmica",
      year: "2024",
      venue: "Nature Communications",
      tags: ["Preclínic", "AAV", "Translacional"],
      blurb:
        "Vaig fer servir perfusió de fetge humà complet per comparar vectors AAV en un model preclínic amb rellevància clínica.",
      href: "https://doi.org/10.1038/s41467-024-46194-y",
    },
    {
      id: 3,
      title: "Model ratolí FRG i AAV-LK03",
      year: "2023",
      venue: "Molecular Therapy Methods & Clinical Development",
      tags: ["Biodistribució", "Models", "Vectorologia"],
      blurb:
        "Vaig caracteritzar el model de ratolí humanitzat FRG i vaig desenvolupar una variant d'AAV-LK03 amb millor biodistribució lobular hepàtica.",
      href: "https://doi.org/10.1016/j.omtm.2022.12.014",
    },
    {
      id: 4,
      title: "Pèptids de defensa de l'hoste",
      year: "2022",
      venue: "Microbial Cell Factories",
      tags: ["Antimicrobià", "Pèptids", "Traslació"],
      blurb:
        "Vaig revisar com els pèptids recombinants de defensa de l'hoste es poden dissenyar i produir per portar-los cap a teràpies antimicrobianes.",
      href: "https://doi.org/10.1186/s12934-022-01991-2",
    },
    {
      id: 5,
      title: "Proteïnes recombinants multidomini",
      year: "2020",
      venue: "Microbial Cell Factories",
      tags: ["Immunologia", "Proteïnes", "Enginyeria"],
      blurb:
        "Vaig construir proteïnes recombinants multidomini amb activitat antimicrobiana d'ampli espectre en format soluble i en nanoclúster.",
      href: "https://doi.org/10.1186/s12934-020-01380-7",
    },
    {
      id: 6,
      title: "Confòrmers proteics d'alta qualitat",
      year: "2021",
      venue: "International Journal of Molecular Sciences",
      tags: ["Confòrmers", "Cossos d'inclusió", "MMP-9 bovina"],
      blurb:
        "Vaig seleccionar confòrmers proteics de més qualitat a partir de mescles recombinants de cossos d'inclusió per millorar activitat i estabilitat.",
      href: "https://doi.org/10.3390/ijms22063020",
    },
  ],
  workLinkLabel: "Veure article",
  timeline: [
    {
      year: "2021 - 2026",
      role: "Investigador",
      company: "Children's Medical Research Institute, Sydney",
      desc: "Vaig desenvolupar una plataforma computacional per al descobriment de pèptids antimicrobians - de prediccions amb models de llenguatge de proteïnes a validació preclínica en models de ratolí. També vaig treballar en enginyeria de càpsides d'AAV per a teràpia gènica.",
    },
    {
      year: "2016 - 2020",
      role: "Investigador predoctoral",
      company: "UAB i IRTA, Barcelona",
      desc: "Vaig dissenyar proteïnes antimicrobianes des de zero - clonatge, producció recombinant, assajos funcionals. Dues patents, quatre articles com a primer autor, vuit en total.",
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
      "Sóc enginyer de proteïnes de formació i científic computacional per necessitat. Em vaig formar en Biotecnologia a Barcelona, vaig fer un màster en Enginyeria Biomèdica a la UC Irvine, i durant el doctorat a la UAB vaig dedicar quatre anys a dissenyar proteïnes antimicrobianes - des del disseny fins a la producció i l'assaig funcional. D'allà en surten dues patents i quatre articles com a primer autor.",
      "A Sydney, al CMRI, vaig muntar una plataforma que mina milions de seqüències per trobar pèptids antimicrobians nous. Vaig fer servir models de llenguatge de proteïnes per predir i acabar-ho traduint en models preclínics. També vaig fer enginyeria de càpsides d'AAV per a teràpia gènica - Nature Communications, Molecular Therapy.",
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
