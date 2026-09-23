export type Question = {
  id: string;
  label: string;
  hint?: string;
  type: "text" | "textarea" | "single" | "multi";
  options?: string[];
  required?: boolean;
};

export type Step = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  questions: Question[];
};

export const steps: Step[] = [
  {
    id: "company",
    eyebrow: "01 / O firmě",
    title: "Nejdřív potřebujeme pochopit, kdo jste.",
    description: "Ne marketingovou poučku. Reálnou firmu, lidi, služby a důvod, proč si vás zákazníci vybírají.",
    questions: [
      { id: "company_one_liner", label: "Jak byste firmu popsali jednou větou?", hint: "Např. rodinná autodoprava pro firmy i soukromníky v Jihomoravském kraji.", type: "textarea", required: true },
      { id: "company_history", label: "Jak dlouho firma funguje a co je důležité z její historie?", type: "textarea" },
      { id: "main_services", label: "Jaké jsou vaše hlavní služby?", hint: "Klidně je napište tak, jak je říkáte zákazníkům.", type: "textarea", required: true },
      { id: "priority_services", label: "Které služby jsou pro vás nejdůležitější?", hint: "Z pohledu zakázek, marže, budoucnosti nebo kapacity.", type: "textarea" },
      { id: "locations", label: "Kde působíte?", hint: "Města, kraje, ČR, zahraničí…", type: "text" },
      { id: "company_scale", label: "Jak velká je firma?", hint: "Zaměstnanci, vozidla, technika, pobočky — stačí orientačně.", type: "textarea" },
      { id: "differentiation", label: "V čem jste podle vás jiní než konkurence?", type: "textarea", required: true },
      { id: "customer_praise", label: "Co na vás zákazníci nejčastěji oceňují?", type: "textarea" },
    ],
  },
  {
    id: "customers",
    eyebrow: "02 / Zákazníci",
    title: "Komu má nový web sednout jako prvnímu?",
    description: "Web nebude pro všechny. Potřebujeme vědět, koho má přesvědčit a co ten člověk řeší.",
    questions: [
      { id: "customer_types", label: "Kdo je váš typický zákazník?", type: "multi", options: ["Soukromé osoby", "Firmy", "Obce a města", "Stavební společnosti", "Výrobní firmy", "Jiné"] },
      { id: "customer_reason", label: "Proč si zákazník vybere právě vás?", type: "textarea" },
      { id: "customer_problem", label: "S čím za vámi zákazník nejčastěji přichází?", type: "textarea" },
      { id: "customer_objections", label: "Jaké námitky mívají zákazníci před objednávkou?", hint: "Cena, termín, důvěra, dostupnost, nejistota, co přesně potřebují…", type: "textarea" },
      { id: "ideal_job", label: "Jak vypadá ideální zakázka?", type: "textarea" },
      { id: "bad_fit_job", label: "Jaká zakázka naopak není pro vás?", type: "textarea" },
      { id: "desired_perception", label: "Jak chcete, aby vás zákazník vnímal?", type: "multi", options: ["Spolehliví", "Rychlí", "Profesionální", "Rodinná firma", "Silná zavedená firma", "Flexibilní", "Prémioví", "Cenově dostupní", "Technicky zdatní", "Lidští"] },
    ],
  },
  {
    id: "brand",
    eyebrow: "03 / Brand DNA",
    title: "Jaká má vaše značka být — a jaká rozhodně ne?",
    description: "Tady z odpovědí později AI složí skutečnou Brand DNA, ne jen seznam přídavných jmen.",
    questions: [
      { id: "brand_words", label: "Vyberte 3–5 slov, která vás mají vystihovat.", type: "textarea", required: true },
      { id: "brand_value", label: "Jaká je nejdůležitější hodnota firmy?", type: "textarea" },
      { id: "brand_never", label: "Co by o vás nový web nikdy neměl komunikovat?", type: "textarea" },
      { id: "motto", label: "Máte motto, slogan nebo větu, kterou ve firmě používáte?", type: "text" },
      { id: "story", label: "Je za firmou příběh, který stojí za zmínku?", type: "textarea" },
      { id: "brand_style", label: "Jak má značka působit?", type: "multi", options: ["Tradičně", "Moderně", "Technicky", "Prémiově", "Jednoduše", "Industriálně", "Osobně", "Odvážně", "Klidně a jistě"] },
      { id: "public_proof", label: "Jaké reference, certifikace nebo čísla můžeme veřejně komunikovat?", hint: "Rok založení, počet vozidel, realizací, zákazníků, certifikace… jen to, co je pravdivé a může být veřejné.", type: "textarea" },
    ],
  },
  {
    id: "visual",
    eyebrow: "04 / Vizuální směr",
    title: "Co už máte a co můžeme posunout?",
    description: "Nechceme zahodit něco, co funguje. Potřebujeme vědět, co má zůstat a co může být úplně nové.",
    questions: [
      { id: "has_logo", label: "Máte aktuální logo v použitelné kvalitě?", type: "single", options: ["Ano", "Ne", "Nevím"] },
      { id: "brand_colors", label: "Používáte firemní barvy?", hint: "Můžete napsat názvy, HEX kódy nebo jen popsat, jak vypadají.", type: "text" },
      { id: "brand_manual", label: "Máte firemní / grafický manuál?", type: "single", options: ["Ano", "Ne", "Nevím"] },
      { id: "photo_assets", label: "Jaké fotografie a materiály můžete dodat?", type: "multi", options: ["Vozidla / technika", "Zaměstnanci", "Provozovna", "Realizace", "Produkty / služby", "Video", "Reference", "Zatím nic"] },
      { id: "keep_visual", label: "Co chcete ze současného vzhledu určitě zachovat?", type: "textarea" },
      { id: "inspiration_sites", label: "Pošlete odkazy na weby, které se vám líbí.", hint: "Nemusí být z vašeho oboru.", type: "textarea" },
      { id: "competitors", label: "Kdo jsou vaši 1–3 hlavní konkurenti?", hint: "Název nebo odkaz. Volitelné.", type: "textarea" },
    ],
  },
  {
    id: "website",
    eyebrow: "05 / Nový web",
    title: "Co má nový web reálně udělat?",
    description: "Neřešíme počet podstránek pro počet podstránek. Řešíme cestu zákazníka k akci.",
    questions: [
      { id: "first_information", label: "Co musí návštěvník pochopit jako první?", type: "textarea", required: true },
      { id: "website_services", label: "Které služby chcete prezentovat samostatně?", type: "textarea" },
      { id: "primary_action", label: "Co má zákazník na webu nejčastěji udělat?", type: "single", options: ["Zavolat", "Napsat e-mail", "Vyplnit poptávku", "Objednat / rezervovat", "Něco jiného"] },
      { id: "sections", label: "Co na webu potřebujete?", type: "multi", options: ["Reference", "Vozový park / technika", "Galerie", "Ceník", "Kariéra", "Aktuality", "Dokumenty", "Kontakty", "FAQ", "Poptávkový formulář"] },
      { id: "languages", label: "V jakých jazycích má web být?", type: "text", hint: "Např. čeština, angličtina, němčina." },
      { id: "keep_old", label: "Co chcete zachovat ze starého webu?", type: "textarea" },
      { id: "old_website_pain", label: "Co vám na současném webu nejvíc vadí?", type: "textarea" },
      { id: "workflow", label: "Jak typicky probíhá spolupráce od prvního kontaktu po hotovou zakázku?", type: "textarea" },
      { id: "approver", label: "Kdo bude schvalovat nový web a obsah?", type: "text" },
      { id: "deadline", label: "Kdy byste ideálně chtěli nový web spustit?", type: "text" },
    ],
  },
  {
    id: "growth",
    eyebrow: "06 / Cíl a marketing",
    title: "Jak poznáme, že web není jen hezký, ale funguje?",
    description: "Tahle část nám pomůže nastavit strukturu, měření i další doporučení.",
    questions: [
      { id: "success_metrics", label: "Co pro vás znamená, že nový web funguje?", type: "multi", options: ["Více poptávek", "Profesionálnější prezentace", "Více telefonátů", "Nábor zaměstnanců", "Méně opakovaných dotazů", "Lepší viditelnost na Googlu", "Větší důvěra", "Jiné"] },
      { id: "lead_sources", label: "Odkud dnes získáváte nové zákazníky?", type: "textarea" },
      { id: "online_leads", label: "Přicházejí vám dnes zakázky přes internet?", type: "single", options: ["Ano, pravidelně", "Občas", "Téměř vůbec", "Nevím"] },
      { id: "google_ads", label: "Používáte Google Ads?", type: "single", options: ["Ano", "Ne", "Nevím"] },
      { id: "seo", label: "Řešíte SEO / organické vyhledávání?", type: "single", options: ["Ano", "Ne", "Nevím"] },
      { id: "google_business", label: "Máte Google firemní profil?", type: "single", options: ["Ano", "Ne", "Nevím"] },
      { id: "socials", label: "Kde jste aktivní?", type: "multi", options: ["Facebook", "Instagram", "LinkedIn", "TikTok", "YouTube", "Nikde"] },
      { id: "online_owner", label: "Kdo se dnes stará o online prezentaci firmy?", type: "textarea" },
    ],
  },
  {
    id: "care",
    eyebrow: "07 / Co bude po spuštění",
    title: "Web spuštěním nekončí.",
    description: "Zjišťujeme, co by vám dlouhodobě dávalo smysl. Bez závazku a bez předem vybraného balíčku.",
    questions: [
      { id: "current_web_owner", label: "Kdo se dnes stará o váš web?", type: "textarea" },
      { id: "incidents", label: "Kdo řeší výpadky nebo technické problémy?", type: "textarea" },
      { id: "change_frequency", label: "Jak často očekáváte změny obsahu?", type: "single", options: ["Několikrát měsíčně", "Asi jednou měsíčně", "Párkrát ročně", "Téměř nikdy", "Nevím"] },
      { id: "edit_preference", label: "Jak chcete řešit budoucí změny?", type: "single", options: ["Pošleme je SkočDál", "Chceme si je dělat sami", "Kombinace obojího", "Nevíme"] },
      { id: "care_interests", label: "O co byste po spuštění mohli mít zájem?", type: "multi", options: ["Hosting", "Zálohy", "Aktualizace", "Zabezpečení", "Úpravy textů a fotek", "Technická podpora", "Doména", "SEO", "Google Analytics", "Google firemní profil", "Obsah", "Reklamy"] },
      { id: "support_channel", label: "Jaký způsob podpory vám vyhovuje?", type: "multi", options: ["E-mail", "Telefon", "WhatsApp"] },
      { id: "monthly_care", label: "Měli byste zájem, abychom se o web dlouhodobě starali za měsíční paušál?", type: "single", options: ["Ano", "Možná, podle nabídky", "Raději si budeme spravovat sami"] },
      { id: "footer_credit", label: "Můžeme být uvedeni jako autor webu v patičce?", type: "single", options: ["Ano", "Ne", "Domluvíme se"] },
      { id: "public_reference", label: "Můžeme projekt po dokončení použít jako veřejnou referenci SkočDál?", type: "single", options: ["Ano", "Ne", "Domluvíme se"], required: true },
    ],
  },
  {
    id: "technical",
    eyebrow: "08 / Technické podklady",
    title: "Ať při přesunu nic nerozbijeme.",
    description: "Hesla sem neposílejte. Potřebujeme jen vědět, kde věci jsou a kdo k nim má přístup.",
    questions: [
      { id: "domain_owner", label: "Kdo vlastní / spravuje doménu?", type: "text" },
      { id: "hosting", label: "Kde je současný hosting?", type: "text" },
      { id: "access_owner", label: "Kdo má přístupy k doméně a hostingu?", type: "text" },
      { id: "email_hosting", label: "Jsou firemní e-maily navázané na současný hosting?", type: "single", options: ["Ano", "Ne", "Nevím"] },
      { id: "google_access", label: "Máte přístup do Google Analytics / Search Console / Google Business?", type: "single", options: ["Ano", "Částečně", "Ne", "Nevím"] },
      { id: "technical_note", label: "Je ještě něco technického, co bychom měli vědět?", type: "textarea" },
    ],
  },
];

export const allQuestions = steps.flatMap((step) => step.questions);
export const questionLabelById = Object.fromEntries(allQuestions.map((q) => [q.id, q.label]));
