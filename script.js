const PIX_KEY = "79991081834";
const PIX_PRICE = "R$ 19,90"; // Ajuste o valor do material aqui

let activeFilter = "all";
let activeSearch = "";

document.addEventListener("DOMContentLoaded", () => {
  renderPixInfo();
  bindFilters();
  bindSearch();
  bindFaq();
  setupRevealAnimations();
  renderFeaturedRecipes();
  renderAnuncioRecipes();
  renderRecipes();
});

function renderPixInfo() {
  const priceEl = document.getElementById("pix-price-display");
  if (priceEl) priceEl.textContent = PIX_PRICE;
  const keyEl = document.getElementById("pix-key-display");
  if (keyEl) keyEl.textContent = PIX_KEY;
}

function copyPixKey() {
  const btn = document.getElementById("pix-copy-btn");
  const msg = document.getElementById("pix-copied-msg");
  const showCopied = () => {
    if (btn) btn.textContent = "✅ Copiado!";
    if (msg) msg.classList.add("visible");
    setTimeout(() => {
      if (btn) btn.textContent = "📋 Copiar chave";
      if (msg) msg.classList.remove("visible");
    }, 2500);
  };
  if (navigator.clipboard) {
    navigator.clipboard.writeText(PIX_KEY).then(showCopied).catch(showCopied);
  } else {
    const el = document.createElement("textarea");
    el.value = PIX_KEY;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    showCopied();
  }
}

function bindFilters() {
  const tabButtons = document.querySelectorAll(".tab-btn");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      activeFilter = button.dataset.filter || "all";
      renderRecipes();
    });
  });
}

function bindFaq() {
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      const answer = question.nextElementSibling;
      const isOpen = question.getAttribute("aria-expanded") === "true";

      question.setAttribute("aria-expanded", String(!isOpen));
      answer.style.maxHeight = isOpen ? "0px" : `${answer.scrollHeight}px`;
    });
  });
}

function bindSearch() {
  const searchInput = document.getElementById("recipe-search");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    activeSearch = searchInput.value.trim().toLowerCase();
    renderRecipes();
  });
}

function setupRevealAnimations() {
  const revealElements = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  revealElements.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 0.04, 0.2)}s`;
    observer.observe(item);
  });
}

function renderFeaturedRecipes() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;

  const featured = receitas.filter((recipe) => RECEITAS_DESTAQUE.includes(recipe.nome));

  grid.innerHTML = featured
    .map((recipe) => {
      return `
        <article class="card featured-item">
          <img class="featured-media" src="${getFeaturedImage(recipe)}" alt="Imagem da receita ${recipe.nome}">
          <span class="photo-note" aria-hidden="true">Foto ilustrativa</span>
          <h3>${recipe.nome}</h3>
          <p>${recipe.descricao}</p>
        </article>
      `;
    })
    .join("");
}

function renderRecipes() {
  const recipesGrid = document.getElementById("recipes-grid");
  const counter = document.getElementById("recipes-counter");
  const recipesSection = document.getElementById("receitas");

  if (!recipesGrid || !counter) return;
  if (recipesSection) recipesSection.classList.add("visible");

  const filtered = receitas.filter((recipe) => {
    const matchesCategory = activeFilter === "all" ? true : recipe.categoriaId === activeFilter;
    const matchesSearch = !activeSearch
      ? true
      : recipe.nome.toLowerCase().includes(activeSearch) || recipe.tags.some((tag) => tag.toLowerCase().includes(activeSearch));

    return matchesCategory && matchesSearch;
  });

  counter.textContent = `${filtered.length} receitas encontradas`;

  try {
    recipesGrid.innerHTML = filtered
      .map((recipe) => {
        const videoUrl = getVideoUrl(recipe);
        const hasDirectVideo = Boolean(getDirectVideoUrl(recipe.nome));
        const tags = recipe.tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
        const icon = getRecipeIcon(recipe.categoriaId);
        const coverImage = getRecipeCover(recipe);

        return `
          <article class="card recipe-card reveal visible">
            <img class="recipe-thumb" src="${coverImage}" alt="Capa da receita ${recipe.nome}">
            <span class="photo-note" aria-hidden="true">Foto ilustrativa</span>
            <div class="recipe-head">
              <span class="recipe-icon">${icon}</span>
              <h3>${recipe.nome}</h3>
            </div>
            <p>${recipe.descricao}</p>
            <div class="recipe-meta">${tags}</div>
            <details class="recipe-accordion">
              <summary>Ler receita completa</summary>
              <div class="recipe-details">
                <h4>Ingredientes</h4>
                <ul class="recipe-list">
                  ${recipe.ingredientes.map((item) => `<li>${item}</li>`).join("")}
                </ul>
                <h4>Modo de preparo (passo a passo)</h4>
                <ol class="recipe-steps">
                  ${recipe.preparo.map((passo) => `<li>${passo}</li>`).join("")}
                </ol>
                <a class="btn btn-secondary recipe-support-btn" href="${videoUrl}" target="_blank" rel="noopener noreferrer">${hasDirectVideo ? "Abrir vídeo de apoio" : "Ver vídeo de apoio"}</a>
              </div>
            </details>
          </article>
        `;
      })
      .join("");
  } catch (error) {
    recipesGrid.innerHTML = "<div class=\"card\"><h3>Não foi possível carregar as receitas agora</h3><p>Atualize a página para tentar novamente.</p></div>";
  }
}

function getRecipeIcon(categoriaId) {
  if (categoriaId === "cat-5") return "🍪";
  if (categoriaId === "cat-6") return "🍮";
  if (categoriaId === "cat-7") return "🥞";
  if (categoriaId === "cat-8") return "💼";
  return "🍰";
}

function getFeaturedImage(recipe) {
  return CURATED_RECIPE_IMAGES[recipe.nome] || FEATURED_IMAGES[recipe.nome] || createRecipeCover(recipe);
}

function getRecipeCover(recipe) {
  return CURATED_RECIPE_IMAGES[recipe.nome] || createRecipeCover(recipe);
}

function createRecipeCover(recipe) {
  const palette = getRecipePalette(recipe.nome);
  const lines = splitTitle(recipe.nome, 24);
  const titleSvg = lines
    .map((line, index) => `<text x="42" y="${220 + index * 38}" fill="${palette.text}" font-family="Georgia, serif" font-size="34" font-weight="700">${escapeXml(line)}</text>`)
    .join("");
  const ingredient = escapeXml(getCoverAccent(recipe.nome));
  const icon = getRecipeIcon(recipe.categoriaId);

  const svg = `
    <svg width="900" height="560" viewBox="0 0 900 560" xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="560" rx="36" fill="${palette.bg}"/>
      <rect x="24" y="24" width="852" height="512" rx="28" fill="${palette.panel}" stroke="${palette.stroke}"/>
      <ellipse cx="744" cy="108" rx="132" ry="74" fill="${palette.soft}"/>
      <ellipse cx="154" cy="462" rx="138" ry="78" fill="${palette.soft2}"/>
      <rect x="42" y="44" width="176" height="38" rx="19" fill="${palette.badge}"/>
      <text x="130" y="68" text-anchor="middle" fill="${palette.badgeText}" font-family="Arial, sans-serif" font-size="15" font-weight="700">RECEITA COMPLETA</text>
      <text x="42" y="126" fill="${palette.subtext}" font-family="Arial, sans-serif" font-size="20" font-weight="700">${ingredient}</text>
      <circle cx="744" cy="108" r="84" fill="${palette.circle}"/>
      <text x="744" y="132" text-anchor="middle" fill="${palette.text}" font-family="Arial, sans-serif" font-size="70">${icon}</text>
      ${titleSvg}
      <rect x="42" y="404" width="476" height="86" rx="20" fill="${palette.card}"/>
      <text x="66" y="438" fill="${palette.text}" font-family="Arial, sans-serif" font-size="20" font-weight="700">Ingredientes e passo a passo</text>
      <text x="66" y="468" fill="${palette.subtext}" font-family="Arial, sans-serif" font-size="18">Abra a receita para ver tudo organizado.</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getRecipePalette(recipeName) {
  const palettes = [
    { bg: "#F7E9D7", panel: "#FFF8EF", stroke: "#D8B696", soft: "#E5EBD7", soft2: "#F1D8B8", badge: "#7D5D40", badgeText: "#FFF9F1", text: "#4E3729", subtext: "#74594A", circle: "#F3D39D", card: "#F7ECDD" },
    { bg: "#F4E6D8", panel: "#FFF9F2", stroke: "#D5B495", soft: "#EFE2C8", soft2: "#DFE9D8", badge: "#A26F48", badgeText: "#FFF8F0", text: "#4F3728", subtext: "#6F5647", circle: "#F1CF96", card: "#FAF0E5" },
    { bg: "#F6EBDD", panel: "#FFFAF4", stroke: "#D9BA9E", soft: "#E7EBD8", soft2: "#EFD8BC", badge: "#6E8A60", badgeText: "#F7FBF5", text: "#4A3528", subtext: "#675244", circle: "#F4D7A4", card: "#FBF1E8" }
  ];

  return palettes[Math.abs(hashString(recipeName)) % palettes.length];
}

function splitTitle(title, lineLength) {
  const words = title.split(" ");
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const tentative = current ? `${current} ${word}` : word;
    if (tentative.length > lineLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = tentative;
    }
  });

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function getCoverAccent(recipeName) {
  const lowerName = recipeName.toLowerCase();
  if (lowerName.includes("banana")) return "banana e cafe da tarde";
  if (lowerName.includes("maçã")) return "maçã com toque caseiro";
  if (lowerName.includes("cenoura")) return "cenoura simples e gostosa";
  if (lowerName.includes("laranja")) return "laranja e aroma suave";
  if (lowerName.includes("milho")) return "bolo caseiro de milho";
  if (lowerName.includes("fubá")) return "sabor de casa de vo";
  if (lowerName.includes("mousse")) return "sobremesa leve";
  if (lowerName.includes("biscoito") || lowerName.includes("cookie") || lowerName.includes("rosquinha")) return "lanche para acompanhar o cafe";
  return "receita afetiva";
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function getDirectVideoUrl(recipeName) {
  // Segurança: só retorna vídeo direto quando o nome da receita bate exatamente.
  // Se não houver link 100% correspondente, cai para busca.
  return DIRECT_VIDEO_URLS[recipeName] || null;
}

function getVideoUrl(recipe) {
  return getDirectVideoUrl(recipe.nome) || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${recipe.nome} receita`)}`;
}

function createRecipe(nome, categoriaId, categoriaNome) {
  const recipeDetails = generateRecipeDetails(nome, categoriaId);

  return {
    nome,
    categoriaId,
    categoriaNome,
    descricao: generateDescription(categoriaNome),
    tags: generateTags(nome, categoriaId),
    ingredientes: recipeDetails.ingredientes,
    preparo: recipeDetails.preparo,
  };
}

function generateRecipeDetails(nome, categoriaId) {
  const lowerName = nome.toLowerCase();
  const isSellingKit = /kit|caixa|embaladas|embalados|saquinho|potinho|fatias|para vender/.test(lowerName);

  if (categoriaId === "cat-8" && isSellingKit) {
    return {
      ingredientes: [
        "Base caseira da receita principal do dia (bolo, biscoito ou doce)",
        "Porções individuais padronizadas",
        "Embalagens limpas e secas para alimento",
        "Etiquetas com data de preparo e validade",
        "Fita ou lacre para acabamento",
      ],
      preparo: [
        "Prepare a receita base em versão mais leve e deixe esfriar completamente antes de montar.",
        "Padronize as porções para manter o mesmo peso e apresentação em todas as unidades.",
        "Monte as embalagens com cuidado, evitando umidade para preservar textura e sabor.",
        "Aplique etiqueta com nome do produto, data de preparo e sugestão de consumo.",
        "Armazene em local fresco e organize por ordem de produção para facilitar as vendas.",
      ],
    };
  }

  const ingredientes = new Set(getBaseIngredients(categoriaId));
  getSpecificIngredients(lowerName).forEach((item) => ingredientes.add(item));

  return {
    ingredientes: Array.from(ingredientes),
    preparo: getBaseSteps(categoriaId, lowerName),
  };
}

function getBaseIngredients(categoriaId) {
  if (categoriaId === "cat-5") {
    return [
      "1 xícara de base seca (aveia fina, polvilho ou farinha da receita)",
      "1 ingrediente de ligação (ovo ou alternativa vegetal)",
      "2 colheres de gordura boa (óleo de coco ou óleo vegetal)",
      "1 pitada de canela ou baunilha (opcional)",
      "1 colher de fermento químico quando a receita pedir",
    ];
  }

  if (categoriaId === "cat-6") {
    return [
      "Fruta base madura ou ingrediente principal da sobremesa",
      "1/4 a 1/2 xícara de adoçante culinário sem açúcar refinado",
      "Canela, cacau ou essência natural para aroma",
      "1 colher de espessante natural quando necessário (chia, aveia ou gelatina sem sabor)",
      "Água ou leite vegetal em pequena quantidade para ajustar textura",
    ];
  }

  if (categoriaId === "cat-7") {
    return [
      "1 xícara da base principal (aveia, tapioca, fruta ou farinha)",
      "1 ovo ou substituto para dar estrutura",
      "2 a 4 colheres de leite vegetal ou água",
      "Canela ou ervas para sabor",
      "1 colher de fermento quando a massa for assada",
    ];
  }

  return [
    "2 ovos",
    "1 xícara de base da massa (aveia, farinha de arroz, fubá ou similar)",
    "1/3 xícara de adoçante culinário sem açúcar refinado",
    "1/3 xícara de líquido (água, suco natural ou leite vegetal)",
    "1 colher de fermento químico",
  ];
}

function getSpecificIngredients(lowerName) {
  const specifics = [];

  if (lowerName.includes("banana")) specifics.push("2 bananas maduras amassadas");
  if (lowerName.includes("maçã")) specifics.push("1 maçã picada ou ralada com casca");
  if (lowerName.includes("cenoura")) specifics.push("1 cenoura média ralada");
  if (lowerName.includes("laranja")) specifics.push("Suco natural de 1 laranja pequena");
  if (lowerName.includes("limão")) specifics.push("Raspas e suco de 1 limão");
  if (lowerName.includes("maracujá")) specifics.push("Polpa de 1 maracujá");
  if (lowerName.includes("abóbora")) specifics.push("1 xícara de abóbora cozida e amassada");
  if (lowerName.includes("mandioca")) specifics.push("1 xícara de mandioca ralada");
  if (lowerName.includes("coco")) specifics.push("1/2 xícara de coco ralado sem açúcar");
  if (lowerName.includes("milho")) specifics.push("1 xícara de milho verde escorrido");
  if (lowerName.includes("fubá")) specifics.push("1/2 xícara de fubá fino");
  if (lowerName.includes("tapioca")) specifics.push("1/2 xícara de tapioca hidratada");
  if (lowerName.includes("cacau") || lowerName.includes("chocolate")) specifics.push("2 colheres de cacau em pó 100%");
  if (lowerName.includes("amendoim")) specifics.push("1/2 xícara de amendoim torrado e moído");
  if (lowerName.includes("pera")) specifics.push("1 pera madura picada");
  if (lowerName.includes("mamão")) specifics.push("1/2 xícara de mamão amassado");
  if (lowerName.includes("ameixa")) specifics.push("4 ameixas secas picadas");
  if (lowerName.includes("abacaxi")) specifics.push("1/2 xícara de abacaxi picado sem caldo");
  if (lowerName.includes("manga")) specifics.push("1/2 xícara de manga madura picada");
  if (lowerName.includes("batata-doce")) specifics.push("1/2 xícara de batata-doce cozida e amassada");
  if (lowerName.includes("inhame")) specifics.push("1/2 xícara de inhame cozido e amassado");
  if (lowerName.includes("chia")) specifics.push("2 colheres de chia hidratada");
  if (lowerName.includes("arroz-doce") || lowerName.includes("canjica")) specifics.push("Leite vegetal suficiente para cozimento cremoso");
  if (lowerName.includes("brigadeiro") || lowerName.includes("beijinho") || lowerName.includes("bombom")) specifics.push("Ponto de enrolar com fogo baixo e mexendo sempre");

  return specifics;
}

function getBaseSteps(categoriaId, lowerName) {
  if (categoriaId === "cat-5") {
    return [
      "Preaqueça o forno a 180 graus e separe uma assadeira com papel manteiga.",
      "Misture os ingredientes secos em uma tigela até ficarem uniformes.",
      "Adicione os ingredientes úmidos e mexa até formar massa modelável.",
      "Modele porções pequenas, mantendo espaço entre elas na assadeira.",
      "Asse por 15 a 25 minutos, até dourar levemente as bordas.",
      "Espere esfriar para firmar e guardar em pote bem fechado.",
    ];
  }

  if (categoriaId === "cat-6") {
    return [
      "Prepare e higienize os ingredientes, deixando frutas já picadas.",
      "Leve ao fogo baixo os ingredientes base, mexendo para não grudar.",
      "Ajuste textura com leite vegetal, água ou espessante natural.",
      "Quando atingir cremosidade adequada, desligue e deixe amornar.",
      "Distribua em potes individuais para facilitar porções.",
      "Leve para gelar ou sirva morno, conforme o tipo da sobremesa.",
    ];
  }

  if (categoriaId === "cat-7") {
    const isAirfryer = lowerName.includes("airfryer");
    return [
      "Misture os ingredientes até formar uma massa homogênea e sem grumos.",
      isAirfryer ? "Preaqueça a airfryer a 160 graus por 3 minutos." : "Aqueça frigideira antiaderente ou forno em temperatura média.",
      "Modele a receita no formato desejado (panqueca, bolinho, muffin ou pãozinho).",
      isAirfryer ? "Asse na airfryer por 10 a 15 minutos, observando para não ressecar." : "Cozinhe/asse até dourar dos dois lados ou firmar no centro.",
      "Finalize com canela, frutas ou complemento leve de sua preferência.",
      "Sirva ainda morno para melhor textura no café da manhã ou lanche.",
    ];
  }

  if (categoriaId === "cat-8") {
    return [
      "Escolha uma base de bolo, biscoito ou doce do material e prepare em lote.",
      "Padronize tamanho das unidades para facilitar preço e produção.",
      "Deixe esfriar completamente antes de embalar para manter qualidade.",
      "Monte porções em embalagens simples e bem fechadas.",
      "Identifique com sabor e data de preparo para organização.",
      "Divulgue com fotos claras e descrição objetiva no WhatsApp.",
    ];
  }

  return [
    "Preaqueça o forno a 180 graus e unte uma forma média com óleo e aveia/fubá.",
    "Misture os ingredientes líquidos em uma tigela até ficar uniforme.",
    "Adicione os ingredientes secos aos poucos e mexa sem bater demais.",
    "Incorpore fermento por último e transfira para a forma.",
    "Asse por 30 a 40 minutos, até dourar e passar no teste do palito.",
    "Deixe amornar antes de desenformar e servir no café da tarde.",
  ];
}

function generateDescription(categoriaNome) {
  if (categoriaNome === "Bolos sem açúcar refinado") return "Receita afetiva em versão mais leve, ideal para variar o cardápio no café da tarde.";
  if (categoriaNome === "Bolos sem glúten") return "Opção sem glúten com preparo simples para quem busca cuidar da alimentação.";
  if (categoriaNome === "Bolos sem lactose") return "Alternativa sem lactose, com sabor caseiro e proposta mais equilibrada.";
  if (categoriaNome === "Bolos com frutas") return "Combinação com frutas para um café da tarde mais leve e cheio de sabor.";
  if (categoriaNome === "Biscoitos e rosquinhas mais leves") return "Receita prática para o lanche, com proposta mais equilibrada e caseira.";
  if (categoriaNome === "Doces caseiros mais leves") return "Doce simples em versão mais leve para quem deseja cuidar da alimentação.";
  if (categoriaNome === "Café da manhã e lanche") return "Preparo rápido para manhãs e lanches, ideal para manter variedade no cardápio.";
  return "Sugestão organizada para quem quer preparar em casa e também ter opção para vender.";
}

function generateTags(nome, categoriaId) {
  const lowerName = nome.toLowerCase();
  const tags = ["café da tarde"];

  if (categoriaId === "cat-1") tags.push("sem açúcar refinado");
  if (categoriaId === "cat-2") tags.push("sem glúten");
  if (categoriaId === "cat-3") tags.push("sem lactose");
  if (categoriaId === "cat-4") tags.push("com frutas");
  if (categoriaId === "cat-8") tags.push("opção para vender");

  if (/banana|maçã|pera|mamão|maracujá|abacaxi|ameixa|manga|laranja|limão|frutas/.test(lowerName) && !tags.includes("com frutas")) {
    tags.push("com frutas");
  }

  return tags;
}

const RECEITAS_DESTAQUE = [
  "Bolo de banana com aveia sem açúcar refinado",
  "Bolo de maçã com canela",
  "Bolo de cenoura mais leve",
  "Bolo de laranja sem açúcar refinado",
  "Bolo de milho sem farinha de trigo",
  "Bolo de chocolate com banana",
  "Biscoito de aveia e banana",
  "Rosquinha de laranja",
  "Doce de banana sem açúcar refinado",
  "Mousse de maracujá mais leve",
];

const P = "https://images.pexels.com/photos/";
const Q = "?auto=compress&cs=tinysrgb&w=600";
const px = (id) => `${P}${id}/pexels-photo-${id}.jpeg${Q}`;

const DIRECT_VIDEO_URLS = {
  "Bolo de banana com aveia sem açúcar refinado": "https://www.youtube.com/watch?v=BALwvmvzFls",
  "Bolo de maçã com canela": "https://www.youtube.com/watch?v=mzxSEv3JzAA",
  "Bolo de cenoura mais leve": "https://www.youtube.com/watch?v=vVnrVQElpqM",
  "Bolo de laranja sem açúcar refinado": "https://www.youtube.com/watch?v=glC1-oUz-Co",
  "Bolo de milho sem farinha de trigo": "https://www.youtube.com/watch?v=x2T5S12es6Q",
  "Bolo de chocolate com banana": "https://www.youtube.com/watch?v=FZdR2JiUQHo",
  "Biscoito de aveia e banana": "https://www.youtube.com/watch?v=4BTPIxyMRTc",
  "Rosquinha de laranja": "https://www.youtube.com/watch?v=Wllgi8_whrc",
  "Doce de banana sem açúcar refinado": "https://www.youtube.com/watch?v=P5ta1I3nU68",
  "Mousse de maracujá mais leve": "https://www.youtube.com/watch?v=RLhjovaGqVs",
};

const FEATURED_IMAGES = {
  "Bolo de banana com aveia sem açúcar refinado": px("36509525"),
  "Bolo de maçã com canela":                      px("31581244"),
  "Bolo de cenoura mais leve":                    px("5594508"),
  "Bolo de laranja sem açúcar refinado":          px("30700690"),
  "Bolo de milho sem farinha de trigo":           px("34637997"),
  "Bolo de chocolate com banana":                 px("37110821"),
  "Biscoito de aveia e banana":                   px("921715"),
  "Rosquinha de laranja":                         px("29380152"),
  "Doce de banana sem açúcar refinado":           px("9550976"),
  "Mousse de maracujá mais leve":                 px("5803197"),
};
const CURATED_RECIPE_IMAGES = {
  // ===== BANANA =====
  "Bolo de banana com aveia sem açúcar refinado": `${P}36509525/pexels-photo-36509525/free-photo-of-slice-of-banana-cake-on-rustic-wooden-table.jpeg${Q}`,
  "Bolo de banana com canela":                    px("8621808"),
  "Bolo de banana madura":                        `${P}36509525/pexels-photo-36509525/free-photo-of-slice-of-banana-cake-on-rustic-wooden-table.jpeg${Q}`,
  "Bolo de banana com maçã":                      px("8621808"),
  "Bolo de banana com uva-passa":                 `${P}36509525/pexels-photo-36509525/free-photo-of-slice-of-banana-cake-on-rustic-wooden-table.jpeg${Q}`,
  "Bolo de banana sem leite":                     px("8621808"),
  "Bolo de banana com farinha de aveia sem glúten":`${P}36509525/pexels-photo-36509525/free-photo-of-slice-of-banana-cake-on-rustic-wooden-table.jpeg${Q}`,
  "Bolo de coco com banana":                      px("8621808"),
  "Mini bolo de banana com aveia":                `${P}36509525/pexels-photo-36509525/free-photo-of-slice-of-banana-cake-on-rustic-wooden-table.jpeg${Q}`,

  // ===== MAÇÃ / APPLE =====
  "Bolo de maçã com canela":          `${P}31581244/pexels-photo-31581244/free-photo-of-delicious-homemade-apple-cake-slice.jpeg${Q}`,
  "Bolo de maçã com aveia":           px("5662081"),
  "Bolo de maçã com castanhas":       `${P}31581244/pexels-photo-31581244/free-photo-of-delicious-homemade-apple-cake-slice.jpeg${Q}`,
  "Bolo de maçã com canela e aveia":  px("5662081"),
  "Bolo de maçã sem glúten":          `${P}31581244/pexels-photo-31581244/free-photo-of-delicious-homemade-apple-cake-slice.jpeg${Q}`,
  "Bolo de maçã sem lactose":         px("5662081"),
  "Mini bolo de maçã com canela":     `${P}31581244/pexels-photo-31581244/free-photo-of-delicious-homemade-apple-cake-slice.jpeg${Q}`,

  // ===== LARANJA / ORANGE =====
  "Bolo de laranja sem açúcar refinado": `${P}30700690/pexels-photo-30700690/free-photo-of-delicious-citrus-loaf-cake-with-orange-glaze.jpeg${Q}`,
  "Bolo de laranja com farinha de arroz": px("10400525"),
  "Bolo de laranja sem leite":           `${P}30700690/pexels-photo-30700690/free-photo-of-delicious-citrus-loaf-cake-with-orange-glaze.jpeg${Q}`,
  "Bolo de laranja natural":             px("10400525"),
  "Mini bolo de laranja":                `${P}30700690/pexels-photo-30700690/free-photo-of-delicious-citrus-loaf-cake-with-orange-glaze.jpeg${Q}`,
  "Rosquinha de laranja":                `${P}29380152/pexels-photo-29380152/free-photo-of-assorted-pastries-on-wooden-tray.jpeg${Q}`,

  // ===== CENOURA / CARROT =====
  "Bolo de cenoura mais leve":          px("5594508"),
  "Bolo de cenoura sem lactose":        px("5742674"),
  "Bolo de cenoura com farinha de arroz": px("5594493"),
  "Mini bolo de cenoura mais leve":     px("5594501"),
  "Muffin de cenoura":                  px("31430610"),

  // ===== MILHO / FUBÁ =====
  "Bolo de milho caseiro mais leve":    px("37228444"),
  "Bolo de fubá com erva-doce":         px("34638000"),
  "Bolo de milho sem farinha de trigo": px("34637997"),
  "Bolo de fubá sem glúten":            px("34637996"),
  "Bolo de milho com leite de coco":    px("37228444"),
  "Bolo de fubá sem lactose":           px("34638000"),
  "Rosquinha de fubá":                  px("34637996"),
  "Mini bolo de milho":                 px("34637997"),

  // ===== COCO / COCONUT =====
  "Bolo de coco sem açúcar refinado":   px("9501706"),
  "Bolo de tapioca com coco":           px("14242068"),
  "Bolo de coco com polvilho doce":     px("36148047"),
  "Bolo de coco com leite vegetal":     px("37124089"),
  "Bolo de abacaxi com coco":           px("14242068"),
  "Bolo de inhame com coco":            px("33183922"),
  "Bolo de abóbora com coco":           px("33183921"),
  "Bolo de abóbora com coco sem lactose": px("9501706"),
  "Cocada de colher mais leve":         px("5149337"),
  "Sequilho de coco":                   px("5149337"),
  "Rosquinha de coco":                  px("7893615"),
  "Beijinho de coco sem açúcar refinado": px("5149337"),
  "Sequilhos de coco em saquinho":      px("5149337"),
  "Potinho de arroz-doce com leite vegetal": px("2173772"),

  // ===== CHOCOLATE / CACAU =====
  "Bolo de chocolate com banana":        `${P}37110821/pexels-photo-37110821/free-photo-of-delicious-chocolate-cake-with-fresh-fruits.jpeg${Q}`,
  "Bolo de cacau com aveia":             `${P}37110821/pexels-photo-37110821/free-photo-of-delicious-chocolate-cake-with-fresh-fruits.jpeg${Q}`,
  "Bolo de cacau sem farinha de trigo":  `${P}37110821/pexels-photo-37110821/free-photo-of-delicious-chocolate-cake-with-fresh-fruits.jpeg${Q}`,
  "Bolo de cacau com banana sem leite":  `${P}37110821/pexels-photo-37110821/free-photo-of-delicious-chocolate-cake-with-fresh-fruits.jpeg${Q}`,
  "Bolo de chocolate com água quente":   `${P}37110821/pexels-photo-37110821/free-photo-of-delicious-chocolate-cake-with-fresh-fruits.jpeg${Q}`,
  "Cookie de cacau com banana":          px("921715"),
  "Biscoito de cacau com aveia":         px("921715"),
  "Brigadeiro de banana com cacau":      `${P}37110821/pexels-photo-37110821/free-photo-of-delicious-chocolate-cake-with-fresh-fruits.jpeg${Q}`,
  "Bombom de banana com cacau":          `${P}37110821/pexels-photo-37110821/free-photo-of-delicious-chocolate-cake-with-fresh-fruits.jpeg${Q}`,
  "Creme de banana com cacau":           px("9550976"),

  // ===== LIMÃO / LEMON =====
  "Bolo de limão mais leve":             px("33898976"),
  "Bolo de limão sem leite":             px("33898994"),
  "Bolo de limão com aveia":             px("33898980"),
  "Mousse de limão com iogurte natural": px("9550976"),
  "Biscoitinho de limão":                `${P}29380152/pexels-photo-29380152/free-photo-of-assorted-pastries-on-wooden-tray.jpeg${Q}`,

  // ===== MARACUJÁ / PASSION FRUIT =====
  "Bolo de maracujá simples":            px("5803197"),
  "Bolo de maracujá leve":              px("5803197"),
  "Bolo de maracujá sem lactose":       px("9550976"),
  "Mousse de maracujá mais leve":       px("5803197"),
  "Potinho de mousse de maracujá leve": px("5803197"),

  // ===== MANDIOCA / TAPIOCA / ARROZ =====
  "Bolo de mandioca caseiro":           px("34637996"),
  "Bolo de mandioca sem glúten":        px("34638000"),
  "Bolo de mandioca sem lactose":       px("34637997"),
  "Bolo de tapioca simples":            px("14242068"),
  "Bolo de arroz simples":              px("5662081"),
  "Arroz-doce com leite vegetal":       px("5803197"),
  "Biscoito de arroz caseiro":          px("921715"),
  "Biscoito de polvilho assado":        `${P}29380152/pexels-photo-29380152/free-photo-of-assorted-pastries-on-wooden-tray.jpeg${Q}`,
  "Biscoito de goma simples":           `${P}29380152/pexels-photo-29380152/free-photo-of-assorted-pastries-on-wooden-tray.jpeg${Q}`,
  "Sequilho de polvilho":               `${P}29380152/pexels-photo-29380152/free-photo-of-assorted-pastries-on-wooden-tray.jpeg${Q}`,
  "Crepioca simples":                   px("5677021"),
  "Tapioca com banana e canela":        px("5677021"),

  // ===== BATATA-DOCE / AMENDOIM / OUTROS BOLOS =====
  "Bolo de batata-doce":                px("1011182"),
  "Pãozinho de batata-doce":            px("28584250"),
  "Biscoitinho de batata-doce":         `${P}29380152/pexels-photo-29380152/free-photo-of-assorted-pastries-on-wooden-tray.jpeg${Q}`,
  "Bolo de amendoim sem açúcar refinado": px("963755"),
  "Bolo de amendoim sem farinha de trigo": px("963755"),
  "Biscoito de amendoim":               px("921715"),
  "Bolo de ameixa mais leve":           `${P}29380152/pexels-photo-29380152/free-photo-of-assorted-pastries-on-wooden-tray.jpeg${Q}`,
  "Bolo de ameixa caseiro":             `${P}29380152/pexels-photo-29380152/free-photo-of-assorted-pastries-on-wooden-tray.jpeg${Q}`,
  "Bolo de pera com canela":            px("5662081"),
  "Compota de pera com canela":         px("5662081"),
  "Bolo de mamão com aveia":            px("1011182"),
  "Creme de mamão com iogurte":         px("9550976"),
  "Bolo de manga simples":              px("9550976"),
  "Bolo de abóbora sem farinha de trigo": px("33183921"),
  "Doce de abóbora com coco":           px("33183921"),
  "Bolo simples de café da tarde sem leite": px("963755"),
  "Bolo de aveia com frutas sem lactose": px("5662081"),
  "Bolo de frutas secas mais leve":     `${P}29380152/pexels-photo-29380152/free-photo-of-assorted-pastries-on-wooden-tray.jpeg${Q}`,

  // ===== BISCOITOS / COOKIES =====
  "Biscoito de aveia e banana":         px("921715"),
  "Biscoito de maçã com canela":        px("921715"),
  "Biscoito de coco sem açúcar refinado": px("7893615"),
  "Biscoito de banana com canela":      px("921715"),
  "Biscoito de aveia com uva-passa":    px("921715"),
  "Biscoito de castanha simples":       px("921715"),
  "Cookie de banana com aveia":         px("921715"),
  "Cookies de banana para vender":      px("921715"),
  "Biscoitos de aveia embalados":       px("921715"),
  "Rosquinhas caseiras para vender":    `${P}29380152/pexels-photo-29380152/free-photo-of-assorted-pastries-on-wooden-tray.jpeg${Q}`,

  // ===== DOCES / PUDINS / MOUSSES =====
  "Doce de banana sem açúcar refinado": px("9550976"),
  "Compota de maçã com canela":         px("5662081"),
  "Gelatina cremosa leve":              px("5803197"),
  "Pudim de banana simples":            px("9550976"),
  "Pudim de chia com frutas":           px("9550976"),
  "Canjica mais leve":                  px("5803197"),
  "Maçã cozida com canela":             px("5662081"),
  "Banana assada com canela":           px("8621808"),
  "Sobremesa de aveia com frutas":      px("2992155"),
  "Potinho de compota de maçã":         px("5662081"),

  // ===== PANQUECAS / MINGAU =====
  "Panqueca de banana com aveia":       px("5677021"),
  "Panqueca de maçã com canela":        px("5677021"),
  "Mingau de aveia com banana":         px("2992155"),
  "Mingau de aveia com maçã":           px("2173772"),

  // ===== PÃO / MUFFIN / BOLINHO =====
  "Pão de aveia de frigideira":         px("28584250"),
  "Pão de queijo de frigideira":        `${P}29380152/pexels-photo-29380152/free-photo-of-assorted-pastries-on-wooden-tray.jpeg${Q}`,
  "Muffin de banana com aveia":         px("4051588"),
  "Muffin de maçã":                     px("13600669"),
  "Bolinho de banana na airfryer":      px("4051608"),
  "Bolinho de maçã na airfryer":        px("4051609"),
  "Torradinha doce com banana e canela":`${P}29380152/pexels-photo-29380152/free-photo-of-assorted-pastries-on-wooden-tray.jpeg${Q}`,

  // ===== RECEITAS PARA VENDER (misc) =====
  "Mini bolo de cenoura mais leve":     px("5594493"),
  "Fatias de bolo saudável embaladas":  px("5662081"),
  "Kit café da tarde saudável":         `${P}29380152/pexels-photo-29380152/free-photo-of-assorted-pastries-on-wooden-tray.jpeg${Q}`,
  "Caixa de bolinhos caseiros leves":   px("10460961"),
};

const CATEGORIAS = [
  {
    id: "cat-1",
    nome: "Bolos sem açúcar refinado",
    receitas: [
      "Bolo de banana com aveia sem açúcar refinado",
      "Bolo de maçã com canela",
      "Bolo de cenoura mais leve",
      "Bolo de laranja sem açúcar refinado",
      "Bolo de milho caseiro mais leve",
      "Bolo de fubá com erva-doce",
      "Bolo de coco sem açúcar refinado",
      "Bolo de chocolate com banana",
      "Bolo de cacau com aveia",
      "Bolo de abóbora com coco",
      "Bolo de mandioca caseiro",
      "Bolo de tapioca simples",
      "Bolo de limão mais leve",
      "Bolo de maçã com aveia",
      "Bolo de banana com canela",
      "Bolo de ameixa mais leve",
      "Bolo de pera com canela",
      "Bolo de mamão com aveia",
      "Bolo de maracujá simples",
      "Bolo de amendoim sem açúcar refinado",
    ],
  },
  {
    id: "cat-2",
    nome: "Bolos sem glúten",
    receitas: [
      "Bolo de milho sem farinha de trigo",
      "Bolo de fubá sem glúten",
      "Bolo de arroz simples",
      "Bolo de tapioca com coco",
      "Bolo de mandioca sem glúten",
      "Bolo de banana com farinha de aveia sem glúten",
      "Bolo de cenoura com farinha de arroz",
      "Bolo de laranja com farinha de arroz",
      "Bolo de coco com polvilho doce",
      "Bolo de cacau sem farinha de trigo",
      "Bolo de maçã sem glúten",
      "Bolo de amendoim sem farinha de trigo",
      "Bolo de batata-doce",
      "Bolo de inhame com coco",
      "Bolo de abóbora sem farinha de trigo",
    ],
  },
  {
    id: "cat-3",
    nome: "Bolos sem lactose",
    receitas: [
      "Bolo de banana sem leite",
      "Bolo de cenoura sem lactose",
      "Bolo de laranja sem leite",
      "Bolo de chocolate com água quente",
      "Bolo de coco com leite vegetal",
      "Bolo de milho com leite de coco",
      "Bolo de maçã sem lactose",
      "Bolo de limão sem leite",
      "Bolo de fubá sem lactose",
      "Bolo de cacau com banana sem leite",
      "Bolo de abóbora com coco sem lactose",
      "Bolo de mandioca sem lactose",
      "Bolo simples de café da tarde sem leite",
      "Bolo de aveia com frutas sem lactose",
      "Bolo de maracujá sem lactose",
    ],
  },
  {
    id: "cat-4",
    nome: "Bolos com frutas",
    receitas: [
      "Bolo de banana madura",
      "Bolo de banana com maçã",
      "Bolo de banana com uva-passa",
      "Bolo de maçã com castanhas",
      "Bolo de maçã com canela e aveia",
      "Bolo de laranja natural",
      "Bolo de limão com aveia",
      "Bolo de maracujá leve",
      "Bolo de abacaxi com coco",
      "Bolo de pera com canela",
      "Bolo de ameixa caseiro",
      "Bolo de mamão com aveia",
      "Bolo de manga simples",
      "Bolo de coco com banana",
      "Bolo de frutas secas mais leve",
    ],
  },
  {
    id: "cat-5",
    nome: "Biscoitos e rosquinhas mais leves",
    receitas: [
      "Biscoito de aveia e banana",
      "Biscoito de maçã com canela",
      "Biscoito de polvilho assado",
      "Biscoito de goma simples",
      "Biscoito de coco sem açúcar refinado",
      "Biscoito de amendoim",
      "Biscoito de cacau com aveia",
      "Biscoito de banana com canela",
      "Sequilho de coco",
      "Sequilho de polvilho",
      "Rosquinha de laranja",
      "Rosquinha de fubá",
      "Rosquinha de coco",
      "Biscoito de aveia com uva-passa",
      "Biscoito de castanha simples",
      "Cookie de banana com aveia",
      "Cookie de cacau com banana",
      "Biscoitinho de limão",
      "Biscoitinho de batata-doce",
      "Biscoito de arroz caseiro",
    ],
  },
  {
    id: "cat-6",
    nome: "Doces caseiros mais leves",
    receitas: [
      "Doce de banana sem açúcar refinado",
      "Compota de maçã com canela",
      "Compota de pera com canela",
      "Gelatina cremosa leve",
      "Mousse de maracujá mais leve",
      "Mousse de limão com iogurte natural",
      "Pudim de banana simples",
      "Pudim de chia com frutas",
      "Arroz-doce com leite vegetal",
      "Canjica mais leve",
      "Cocada de colher mais leve",
      "Creme de banana com cacau",
      "Maçã cozida com canela",
      "Banana assada com canela",
      "Doce de abóbora com coco",
      "Brigadeiro de banana com cacau",
      "Beijinho de coco sem açúcar refinado",
      "Bombom de banana com cacau",
      "Sobremesa de aveia com frutas",
      "Creme de mamão com iogurte",
    ],
  },
  {
    id: "cat-7",
    nome: "Café da manhã e lanche",
    receitas: [
      "Panqueca de banana com aveia",
      "Panqueca de maçã com canela",
      "Mingau de aveia com banana",
      "Mingau de aveia com maçã",
      "Crepioca simples",
      "Tapioca com banana e canela",
      "Pão de aveia de frigideira",
      "Pãozinho de batata-doce",
      "Pão de queijo de frigideira",
      "Muffin de banana com aveia",
      "Muffin de maçã",
      "Muffin de cenoura",
      "Bolinho de banana na airfryer",
      "Bolinho de maçã na airfryer",
      "Torradinha doce com banana e canela",
    ],
  },
  {
    id: "cat-8",
    nome: "Receitas para vender",
    receitas: [
      "Mini bolo de banana com aveia",
      "Mini bolo de cenoura mais leve",
      "Mini bolo de laranja",
      "Mini bolo de maçã com canela",
      "Mini bolo de milho",
      "Fatias de bolo saudável embaladas",
      "Kit café da tarde saudável",
      "Potinho de mousse de maracujá leve",
      "Potinho de arroz-doce com leite vegetal",
      "Potinho de compota de maçã",
      "Cookies de banana para vender",
      "Biscoitos de aveia embalados",
      "Rosquinhas caseiras para vender",
      "Sequilhos de coco em saquinho",
      "Caixa de bolinhos caseiros leves",
    ],
  },
];

const receitas = CATEGORIAS.flatMap((categoria) => {
  return categoria.receitas.map((nome) => createRecipe(nome, categoria.id, categoria.nome));
});

// ============================================================
// RECEITAS DO ANÚNCIO — conteúdo completo
// ============================================================

const RECEITAS_ANUNCIO = [
  {
    nome: "Bolo Simples Fofinho de Café da Tarde",
    emoji: "🍰",
    descricao: "Um bolo básico, macio e caseiro, perfeito para acompanhar café ou chá.",
    popular: true,
    videoUrl: "https://www.youtube.com/watch?v=OsdlZ7QVRX4",
    tempo: "40 minutos",
    rendimento: "12 fatias",
    ingredientes: [
      "3 ovos",
      "1 xícara de farinha de trigo (ou farinha de aveia para versão mais leve)",
      "1/2 xícara de adoçante culinário ou açúcar mascavo",
      "1/2 xícara de leite (ou leite vegetal)",
      "1/3 xícara de óleo vegetal",
      "1 colher (sopa) de fermento químico",
      "1 colher (chá) de extrato de baunilha",
      "Pitada de sal",
    ],
    preparo: [
      "Preaqueça o forno a 180 graus e unte uma forma redonda com óleo e farinha.",
      "Bata os ovos com o adoçante até ficar cremoso e levemente claro.",
      "Adicione o leite, o óleo e a baunilha, misturando bem.",
      "Incorpore a farinha aos poucos, misturando delicadamente sem bater demais.",
      "Adicione o fermento por último e mexa suavemente para não perder o ar.",
      "Despeje na forma e asse por 30 a 35 minutos, até dourar e o palito sair limpo.",
      "Espere 10 minutos antes de desenformar. Sirva com café ou chá.",
    ],
    dica: "Para um toque especial, polvilhe açúcar de coco ou canela por cima antes de servir.",
  },
  {
    nome: "Bolo Mesclado com Cobertura de Chocolate",
    emoji: "🎂",
    descricao: "Massa fofinha com efeito mesclado e cobertura cremosa de chocolate.",
    popular: true,
    videoUrl: "https://www.youtube.com/watch?v=iKNe4rAVnuA",
    tempo: "50 minutos",
    rendimento: "12 fatias",
    ingredientes: [
      "3 ovos",
      "1 xícara de farinha de trigo",
      "1/2 xícara de adoçante culinário",
      "1/2 xícara de leite",
      "1/3 xícara de óleo",
      "1 colher (sopa) de fermento",
      "3 colheres (sopa) de cacau em pó 100%",
      "Para a cobertura: 4 col. (sopa) de cacau, 3 col. (sopa) de mel ou adoçante, 2 col. (sopa) de leite vegetal",
    ],
    preparo: [
      "Preaqueça o forno a 180 graus e unte uma forma redonda.",
      "Bata ovos com adoçante, leite e óleo até ficar homogêneo.",
      "Adicione a farinha e o fermento, misturando delicadamente.",
      "Divida a massa em duas partes iguais. Em uma delas, misture o cacau em pó.",
      "Coloque colheradas alternadas das duas massas na forma.",
      "Passe um palito em zigue-zague para criar o efeito mesclado.",
      "Asse por 35 a 40 minutos. Espere esfriar completamente.",
      "Para a cobertura: misture cacau, adoçante e leite vegetal em fogo baixo, mexendo até encorpar. Espalhe sobre o bolo frio.",
    ],
    dica: "A cobertura fica mais brilhante se você adicionar uma colher de óleo de coco enquanto ainda está no fogo.",
  },
  {
    nome: "Cuca Caseira de Banana com Farofinha",
    emoji: "🍌",
    descricao: "Receita afetiva com banana madura e farofinha crocante por cima.",
    popular: false,
    videoUrl: "https://www.youtube.com/watch?v=2IUsfAt7QaA",
    tempo: "55 minutos",
    rendimento: "12 porções",
    ingredientes: [
      "3 bananas maduras fatiadas",
      "2 ovos",
      "1 xícara de farinha de trigo (ou aveia em flocos finos)",
      "1/2 xícara de adoçante culinário",
      "1/3 xícara de leite",
      "1/4 xícara de óleo",
      "1 colher (sopa) de fermento",
      "Para a farofa: 3 col. (sopa) de farinha, 2 col. (sopa) de açúcar mascavo, 2 col. (sopa) de manteiga, canela a gosto",
    ],
    preparo: [
      "Preaqueça o forno a 180 graus.",
      "Bata os ovos com adoçante, leite e óleo até homogêneo.",
      "Adicione a farinha e o fermento, misturando até ficar liso.",
      "Despeje a massa na forma untada.",
      "Distribua as fatias de banana por toda a superfície.",
      "Prepare a farofa: misture farinha, açúcar mascavo, manteiga e canela com os dedos até granular.",
      "Espalhe a farofa por cima das bananas.",
      "Asse por 40 a 45 minutos, até dourar bem por cima.",
    ],
    dica: "Use bananas bem maduras para mais doçura natural e textura mais macia na massa.",
  },
  {
    nome: "Bolo de Limão com Cobertura Cremosa",
    emoji: "🍋",
    descricao: "Bolo leve e aromático, com cobertura cremosa e toque cítrico.",
    popular: false,
    videoUrl: "https://www.youtube.com/watch?v=J6f8vgBNqXQ",
    tempo: "45 minutos",
    rendimento: "10 fatias",
    ingredientes: [
      "3 ovos",
      "Raspas e suco de 2 limões",
      "1 xícara de farinha de trigo (ou farinha de arroz para versão mais leve)",
      "1/2 xícara de adoçante culinário",
      "1/3 xícara de óleo",
      "1/3 xícara de leite",
      "1 colher (sopa) de fermento",
      "Para a cobertura: 3 col. (sopa) de suco de limão + 4 col. (sopa) de açúcar de confeiteiro (ou adoçante em pó)",
    ],
    preparo: [
      "Preaqueça o forno a 180 graus e unte uma forma tipo inglesa.",
      "Bata ovos com adoçante até espumar levemente.",
      "Adicione o óleo, leite, suco e raspas de limão, misturando bem.",
      "Incorpore a farinha aos poucos, misturando sem bater demais.",
      "Adicione o fermento por último e misture suavemente.",
      "Asse por 30 a 35 minutos. Espere esfriar completamente.",
      "Misture o suco de limão com o açúcar em pó até formar uma pasta brilhante. Espalhe sobre o bolo frio.",
    ],
    dica: "Raspe bem o limão antes de espremer — as raspas trazem muito mais aroma para a massa.",
  },
  {
    nome: "Bolo de Chocolate Fofinho",
    emoji: "🍫",
    descricao: "Uma opção clássica para quem ama chocolate no café da tarde.",
    popular: true,
    videoUrl: "https://www.youtube.com/watch?v=qg2EqHDyJGM",
    tempo: "45 minutos",
    rendimento: "12 fatias",
    ingredientes: [
      "3 ovos",
      "1 xícara de farinha de trigo",
      "4 colheres (sopa) de cacau em pó 100%",
      "1/2 xícara de adoçante culinário",
      "1/2 xícara de leite quente",
      "1/3 xícara de óleo",
      "1 colher (sopa) de fermento",
      "1 colher (chá) de extrato de baunilha",
    ],
    preparo: [
      "Preaqueça o forno a 180 graus e unte uma forma redonda.",
      "Dissolva o cacau em pó no leite quente, misturando bem. Reserve.",
      "Bata os ovos com o adoçante, o óleo e a baunilha.",
      "Adicione o leite com cacau e misture até incorporar.",
      "Incorpore a farinha aos poucos, misturando delicadamente.",
      "Adicione o fermento por último, com movimentos suaves.",
      "Despeje na forma e asse por 35 a 40 minutos.",
      "Teste com palito. Deixe amornar 10 minutos antes de desenformar.",
    ],
    dica: "O cacau em pó 100% traz sabor intenso sem açúcar adicionado — escolha sempre o de boa qualidade.",
  },
  {
    nome: "Brownie Caseiro de Chocolate",
    emoji: "🟫",
    descricao: "Doce simples, intenso e perfeito para servir em pedaços.",
    popular: true,
    videoUrl: "https://www.youtube.com/watch?v=I2VUOvU-xTQ",
    tempo: "35 minutos",
    rendimento: "16 pedaços",
    ingredientes: [
      "2 ovos",
      "5 colheres (sopa) de cacau em pó 100%",
      "1/2 xícara de adoçante culinário",
      "1/3 xícara de farinha de trigo (ou aveia em flocos finos)",
      "1/3 xícara de óleo de coco ou manteiga",
      "1 colher (chá) de extrato de baunilha",
      "Pitada de sal",
      "1/2 colher (chá) de fermento",
    ],
    preparo: [
      "Preaqueça o forno a 180 graus.",
      "Derreta o óleo de coco ou a manteiga e deixe amornar.",
      "Misture os ovos, o adoçante, a baunilha e o óleo até ficar homogêneo.",
      "Adicione o cacau, a farinha e o sal, misturando delicadamente.",
      "Adicione o fermento por último.",
      "Despeje em forma quadrada untada e enfarinhada.",
      "Asse por 20 a 25 minutos — o centro deve ficar um pouco úmido.",
      "Espere esfriar completamente antes de cortar em pedaços.",
    ],
    dica: "Não asse demais: o brownie deve sair do forno levemente úmido no centro para ficar cremoso e marcante.",
  },
  {
    nome: "Bolo Gelado Cremoso de Morango",
    emoji: "🍓",
    descricao: "Receita bonita, cremosa e especial para servir em ocasiões diferentes.",
    popular: true,
    videoUrl: "https://www.youtube.com/watch?v=2VTHNlzEG7c",
    tempo: "60 minutos + geladeira",
    rendimento: "12 porções",
    ingredientes: [
      "Para a base: 1 pacote de biscoito (ou versão mais leve), 3 col. (sopa) de manteiga",
      "Para o creme: 200g de cream cheese ou requeijão, 1 caixa de creme de leite, 4 col. de adoçante, 1 col. de suco de limão",
      "Para a cobertura: 300g de morangos frescos fatiados, 2 col. de adoçante",
      "1 envelope de gelatina sem sabor incolor",
    ],
    preparo: [
      "Triture os biscoitos e misture com a manteiga até formar farofa úmida. Forre o fundo de uma forma.",
      "Bata o cream cheese com o creme de leite, o adoçante e o suco de limão até ficar bem cremoso.",
      "Despeje o creme sobre a base de biscoito e nivele com uma espátula.",
      "Prepare a gelatina conforme a embalagem, deixe amornar e misture com os morangos e o adoçante.",
      "Espalhe a cobertura de morango sobre o creme.",
      "Leve à geladeira por no mínimo 4 horas antes de servir.",
    ],
    dica: "Pode substituir o morango por pêssego, framboesa ou qualquer fruta da estação — fica lindo e delicioso.",
  },
  {
    nome: "Bolo de Aveia com Banana",
    emoji: "🌾",
    descricao: "Opção mais leve, com ingredientes simples e sabor de casa.",
    popular: false,
    videoUrl: "https://www.youtube.com/watch?v=4BjT2Gi5YfA",
    tempo: "40 minutos",
    rendimento: "10 fatias",
    ingredientes: [
      "2 bananas maduras amassadas",
      "2 ovos",
      "1 xícara de aveia em flocos finos",
      "1/3 xícara de adoçante culinário (ou a gosto)",
      "1/4 xícara de leite (ou leite vegetal)",
      "2 colheres (sopa) de óleo",
      "1 colher (sopa) de fermento",
      "Canela a gosto",
    ],
    preparo: [
      "Preaqueça o forno a 180 graus e unte uma forma pequena.",
      "Amasse bem as bananas com um garfo até virar purê.",
      "Misture os ovos com o adoçante e junte ao purê de banana.",
      "Adicione o leite e o óleo, misturando bem.",
      "Incorpore a aveia, a canela e o fermento, misturando até homogêneo.",
      "Despeje na forma e asse por 30 a 35 minutos.",
      "Teste com palito. Deixe amornar antes de cortar.",
    ],
    dica: "Quanto mais madura a banana, mais natural é a doçura — você pode reduzir ou até dispensar o adoçante.",
  },
  {
    nome: "Biscoitinho Caseiro para Café",
    emoji: "🍪",
    descricao: "Biscoitinho simples para acompanhar café, chá ou lanche da tarde.",
    popular: false,
    videoUrl: "https://www.youtube.com/watch?v=z_zJ7YN3P4Q",
    tempo: "30 minutos",
    rendimento: "30 biscoitos",
    ingredientes: [
      "2 xícaras de farinha de trigo (ou aveia fina)",
      "1/2 xícara de manteiga em temperatura ambiente",
      "1/2 xícara de adoçante culinário",
      "1 ovo",
      "1 colher (chá) de extrato de baunilha",
      "1 pitada de sal",
      "Canela a gosto (opcional)",
    ],
    preparo: [
      "Preaqueça o forno a 180 graus.",
      "Misture a manteiga com o adoçante até formar um creme suave.",
      "Adicione o ovo e a baunilha, misturando bem.",
      "Incorpore a farinha, o sal e a canela, formando uma massa que não gruda nas mãos.",
      "Modele bolinhas pequenas e disponha em assadeira forrada com papel manteiga.",
      "Achate levemente cada bolinha com um garfo.",
      "Asse por 15 a 18 minutos, até dourar levemente as bordas.",
      "Deixe esfriar completamente na assadeira — ficam crocantes ao esfriar.",
    ],
    dica: "Guarde em pote com tampa bem fechada e duram até 5 dias sem perder a crocância.",
  },
  {
    nome: "Rosquinha Caseira Leve",
    emoji: "⭕",
    descricao: "Receita tradicional, simples e perfeita para guardar em potes.",
    popular: false,
    videoUrl: "https://www.youtube.com/watch?v=XJTDvWnuZuU",
    tempo: "35 minutos",
    rendimento: "25 rosquinhas",
    ingredientes: [
      "2 xícaras de farinha de trigo",
      "1/2 xícara de amido de milho",
      "1/2 xícara de manteiga em temperatura ambiente",
      "3 colheres (sopa) de adoçante culinário",
      "1 ovo",
      "1 colher (sopa) de leite",
      "1 colher (chá) de extrato de baunilha",
    ],
    preparo: [
      "Preaqueça o forno a 180 graus.",
      "Misture a manteiga com o adoçante até formar um creme leve.",
      "Adicione o ovo, o leite e a baunilha, misturando bem.",
      "Incorpore a farinha e o amido até formar uma massa firme e macia.",
      "Modele rosquinhas com as mãos ou use saco de confeiteiro com bico estrela.",
      "Disponha em assadeira e asse por 20 a 25 minutos, até dourar levemente.",
      "Deixe esfriar completamente antes de guardar.",
    ],
    dica: "Acrescente raspas de limão ou laranja na massa para dar um aroma especial e diferenciado.",
  },
];

function renderAnuncioRecipes() {
  const grid = document.getElementById("anuncio-grid");
  if (!grid) return;

  grid.innerHTML = RECEITAS_ANUNCIO.map((recipe, index) => {
    const ingredientesHtml = recipe.ingredientes.map((item) => `<li>${item}</li>`).join("");
    const preparoHtml = recipe.preparo.map((passo, i) => `<li>${passo}</li>`).join("");
    const popularBadge = recipe.popular ? `<span class="anuncio-badge anuncio-badge-popular">⭐ Mais procurada</span>` : "";

    return `
      <article class="anuncio-card reveal visible" style="animation-delay: ${index * 0.05}s">
        <div class="anuncio-card-top">
          ${popularBadge}
          <span class="anuncio-badge anuncio-badge-video">🎬 Do anúncio</span>
        </div>
        <div class="anuncio-card-icon">${recipe.emoji}</div>
        <h3 class="anuncio-card-title">${recipe.nome}</h3>
        <p class="anuncio-card-desc">${recipe.descricao}</p>
        <div class="anuncio-card-meta">
          <span>⏱ ${recipe.tempo}</span>
          <span>🍽 ${recipe.rendimento}</span>
        </div>
        <details class="anuncio-accordion">
          <summary class="anuncio-accordion-btn">Ver receita completa</summary>
          <div class="anuncio-accordion-body">
            <h4>Ingredientes</h4>
            <ul class="anuncio-list">${ingredientesHtml}</ul>
            <h4>Modo de preparo</h4>
            <ol class="anuncio-steps">${preparoHtml}</ol>
            <div class="anuncio-tip">
              <strong>💡 Dica especial:</strong> ${recipe.dica}
            </div>
            <a class="btn btn-secondary recipe-support-btn" href="${recipe.videoUrl}" target="_blank" rel="noopener noreferrer">🎬 Abrir vídeo de apoio</a>
            <p class="anuncio-disclaimer">⚠️ Em caso de restrições alimentares, consulte um profissional de saúde.</p>
          </div>
        </details>
      </article>
    `;
  }).join("");
}
