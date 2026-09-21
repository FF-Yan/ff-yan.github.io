// Single source of truth for every project card / detail page.
// `home` = featured card on the homepage (only set for projects shown there).
// `listing` = card on /projects/. `detail` = full project page (omit for
// projects that only ever get a listing card, like the site itself).
//
// Tag lists intentionally differ in length between home/listing/detail
// (short teaser tags vs. a fuller technical breakdown) but must stay in
// sync between en/zh — keep both arrays the same length and order.

const projects = [
  {
    slug: 'chromatic',
    thumbClass: 'thumb-chroma',
    cardImage: { src: '/assets/images/chromatic/ingame1.webp', alt: 'Chromatic', width: 1600, height: 907 },
    externalLink: { type: 'github', url: 'https://github.com/Hbadmus/Chromatic' },
    en: {
      title: 'Chromatic (In Progress)',
      name: 'Chromatic',
      type: 'Game Dev &mdash; Team Project',
      role: 'Gameplay Programmer',
      period: 'Jan 2026 &ndash; Present',
      thumbLabel: 'Unity · C# · Puzzle Platformer',
      home: {
        desc: '2D puzzle-platformer where players restore color to a grayscale world. Built color-based interaction mechanics, reusable component architecture, and color unlock progression affecting world state and puzzle configurations.',
        tags: ['Unity', 'C#', 'Puzzle Platformer'],
      },
      listing: {
        desc: 'Built gameplay systems in Unity (C#), including color-based interaction mechanics that dynamically modify object physics and level traversal. Designed reusable components enabling multiple systems to share core logic while maintaining unique behavior. Implemented color unlock progression affecting world state and puzzle configurations across a 4-person team.',
        tags: ['Unity', 'C#', 'Puzzle Platformer', 'GitHub'],
      },
      detail: {
        pageEyebrow: '// Game Project &mdash; Puzzle Platformer',
        overview: '<strong>Chromatic</strong> is a 2D puzzle-platformer where players restore color to a grayscale world by defeating bosses and solving environmental puzzles. The core mechanic lets players apply colors to objects, changing their physical properties and unlocking new traversal and puzzle solutions.',
        tags: ['Unity', 'C#', 'Puzzle Platformer', 'Game Systems', 'Team Project'],
        overviewImage: { src: '/assets/images/chromatic/ingame1.webp', alt: 'Chromatic - In-Game', overlay: true, width: 1600, height: 907 },
        gallery: [
          { src: '/assets/images/chromatic/ingame1.webp', alt: 'Chromatic – In-Game', width: 1600, height: 907 },
        ],
        contributions: [
          'Built core gameplay systems in Unity (C#), including color-based interaction mechanics that modify object properties, world physics, and traversal.',
          'Designed puzzle-driven boss encounters centered on mechanics and environment logic instead of traditional combat loops.',
          'Imported and implemented art assets and UI elements, integrating them into gameplay flow to improve visual consistency and user interaction.',
          'Developed color unlock progression that transforms world state and updates puzzle configurations dynamically.',
          'Collaborated in a 4-person team using GitHub, maintaining reusable systems that support unique per-level and per-boss behavior.',
        ],
        techTags: ['Unity', 'C#', 'FSM AI', 'Modular Architecture', 'GitHub', 'Team Collaboration'],
      },
      seo: 'Chromatic is a 2D puzzle-platformer where players restore color to a grayscale world, solving puzzles and defeating bosses through color-based mechanics. Built in Unity with C#.',
    },
    zh: {
      title: 'Chromatic (进行中)',
      name: 'Chromatic',
      type: '游戏开发 &mdash; 团队项目',
      role: '游戏程序员',
      period: '2026年1月 &ndash; 至今',
      thumbLabel: 'Unity · C# · 解谜平台跳跃',
      home: {
        desc: '2D 解谜平台跳跃游戏，玩家通过击败 Boss 与解谜将灰度世界还原为彩色。开发了颜色交互机制、可复用组件架构与颜色解锁进度系统，动态改变世界状态与谜题配置。',
        tags: ['Unity', 'C#', '解谜平台跳跃'],
      },
      listing: {
        desc: '使用 Unity 和 C# 开发核心游戏系统，包括基于颜色的交互机制（动态改变物体物理属性与关卡通行方式）、可复用组件架构（多系统共享核心逻辑同时保持独立行为），以及颜色解锁进度系统（影响世界状态与谜题配置）。与四人团队通过 GitHub 协作开发。',
        tags: ['Unity', 'C#', '解谜平台跳跃', 'GitHub'],
      },
      detail: {
        pageEyebrow: '// 游戏项目 &mdash; 解谜平台跳跃',
        overview: '<strong>Chromatic</strong> 是一款 2D 解谜平台跳跃游戏，玩家通过击败 Boss 与环境解谜，将灰度世界逐步恢复为彩色。核心机制是对物体施加颜色，改变其物理属性，从而解锁新的路径与解谜方案。',
        tags: ['Unity', 'C#', '解谜平台跳跃', '游戏系统', '团队项目'],
        overviewImage: { src: '/assets/images/chromatic/ingame1.webp', alt: 'Chromatic - 游戏内截图', overlay: true, width: 1600, height: 907 },
        gallery: [
          { src: '/assets/images/chromatic/ingame1.webp', alt: 'Chromatic – 游戏内截图', width: 1600, height: 907 },
        ],
        contributions: [
          '使用 Unity（C#）开发核心玩法系统，构建颜色交互机制，让玩家行为动态改变物体属性、世界物理与通行方式。',
          '围绕"机制 + 场景逻辑"设计并实现解谜型 Boss 体验，弱化传统数值战斗，强调观察与解法。',
          '负责导入并实现 Art Assets 与 UI 元素，将其整合到玩法流程中，提升视觉一致性与交互体验。',
          '开发颜色解锁进度系统，使世界状态与谜题配置随能力获取动态变化。',
          '在四人团队中使用 GitHub 协作，维护可复用核心系统并支持不同 Boss/关卡的差异化行为。',
        ],
        techTags: ['Unity', 'C#', '有限状态机 AI', '模块化架构', 'GitHub', '团队协作'],
      },
      seo: '《Chromatic》是一款 2D 解谜平台跳跃游戏，玩家通过基于颜色的机制为灰度世界恢复色彩、解谜并击败 Boss。使用 Unity 与 C# 开发。',
    },
  },

  {
    slug: 'glass-ceiling',
    thumbClass: 'thumb-gc',
    cardImage: { src: '/assets/images/glass-ceiling/menu.webp', alt: 'Glass Ceiling', width: 1600, height: 873 },
    externalLink: { type: 'itch', url: 'https://aidan-moreau04.itch.io/glass-ceiling' },
    en: {
      title: 'Glass Ceiling',
      type: 'Game Dev &mdash; Team Project',
      role: 'Gameplay Programmer',
      period: 'Sep &ndash; Dec 2025',
      thumbLabel: 'Unity · C# · Horror Puzzle',
      home: {
        desc: 'Developed core gameplay programming, UI system, mechanics, and audio integration using Unity &amp; C#. Delivered a fully playable horror-puzzle demo with iterative playtesting and polish.',
        tags: ['Unity', 'C#', 'Horror Puzzle'],
      },
      listing: {
        desc: 'Developed core gameplay programming, UI system, mechanics, and audio integration using Unity &amp; C#. Delivered a fully playable horror-puzzle demo with iterative playtesting and polish. Optimized player interactions to enhance UX and overall playability across all team milestones.',
        tags: ['Unity', 'C#', 'Horror Puzzle', 'UI Systems'],
      },
      detail: {
        pageEyebrow: '// Game Project &mdash; Horror Puzzle',
        overview: '<strong>Glass Ceiling</strong> is a horror-puzzle game developed over a semester as a team project at Northeastern University. Players navigate a tense, atmospheric environment, solving puzzles while avoiding danger — all delivered in a fully playable demo polished through multiple playtesting rounds.',
        tags: ['Unity', 'C#', 'Horror Puzzle', 'UI Systems', 'Audio', 'Team Project'],
        overviewImage: { src: '/assets/images/glass-ceiling/menu.webp', alt: 'Glass Ceiling - Main Menu', overlay: false, width: 1600, height: 873 },
        gallery: [
          { src: '/assets/images/glass-ceiling/menu.webp', alt: 'Glass Ceiling – Main Menu', width: 1600, height: 873 },
          { src: '/assets/images/glass-ceiling/ingame1.webp', alt: 'Glass Ceiling – In-Game', width: 1600, height: 986 },
          { src: '/assets/images/glass-ceiling/ingame2.webp', alt: 'Glass Ceiling – In-Game Scene 2', width: 752, height: 370 },
          { src: '/assets/images/glass-ceiling/ingame3.webp', alt: 'Glass Ceiling – In-Game Scene 3', width: 768, height: 656 },
        ],
        contributions: [
          'Programmed core gameplay mechanics including player interactions, object manipulation, and state machines using Unity &amp; C#.',
          'Built the UI system from scratch — HUD elements, menus, and in-game feedback panels.',
          'Integrated audio: ambient soundscapes, reactive sound effects, and positional audio for horror atmosphere.',
          'Participated in iterative playtesting sessions, collecting feedback and implementing fixes across multiple milestones.',
          'Collaborated with artists and designers in a structured team environment to align gameplay with creative vision.',
        ],
        techTags: ['Unity 2022', 'C#', 'Unity UI Toolkit', 'Unity Audio Mixer', 'GitHub', 'Jira'],
      },
      seo: 'Glass Ceiling is a horror-puzzle game built in Unity — a fully playable demo with core gameplay programming, UI systems, mechanics, and audio integration.',
    },
    zh: {
      title: 'Glass Ceiling',
      type: '游戏开发 &mdash; 团队项目',
      role: '游戏程序员',
      period: '2025年9月 &ndash; 12月',
      thumbLabel: 'Unity · C# · 恐怖解谜',
      home: {
        desc: '使用 Unity 和 C# 完成核心游戏编程、UI 系统、机制设计与音效集成，交付了一款完整可玩的恐怖解谜 Demo，经过多轮迭代测试与打磨。',
        tags: ['Unity', 'C#', '恐怖解谜'],
      },
      listing: {
        desc: '使用 Unity 和 C# 完成核心游戏编程、UI 系统、机制设计与音效集成，交付了一款完整可玩的恐怖解谜 Demo，经过多轮迭代测试与打磨，不断优化玩家交互体验与整体可玩性。',
        tags: ['Unity', 'C#', '恐怖解谜', 'UI系统'],
      },
      detail: {
        pageEyebrow: '// 游戏项目 &mdash; 恐怖解谜',
        overview: '<strong>Glass Ceiling</strong> 是一款在东北大学学期项目中与团队共同开发的恐怖解谜游戏。玩家在充满张力的大气环境中解谜，同时躲避危险——经过多轮迭代测试与打磨，最终交付完整可玩的 Demo。',
        tags: ['Unity', 'C#', '恐怖解谜', 'UI系统', '音效', '团队项目'],
        overviewImage: { src: '/assets/images/glass-ceiling/menu.webp', alt: 'Glass Ceiling - 主菜单', overlay: false, width: 1600, height: 873 },
        gallery: [
          { src: '/assets/images/glass-ceiling/menu.webp', alt: 'Glass Ceiling – 主菜单', width: 1600, height: 873 },
          { src: '/assets/images/glass-ceiling/ingame1.webp', alt: 'Glass Ceiling – 游戏内截图', width: 1600, height: 986 },
          { src: '/assets/images/glass-ceiling/ingame2.webp', alt: 'Glass Ceiling – 游戏内截图 2', width: 752, height: 370 },
          { src: '/assets/images/glass-ceiling/ingame3.webp', alt: 'Glass Ceiling – 游戏内截图 3', width: 768, height: 656 },
        ],
        contributions: [
          '使用 Unity 和 C# 完成核心游戏机制编程，包括玩家交互、物品操作与状态机设计。',
          '从零搭建 UI 系统：HUD 元素、菜单界面及游戏内反馈面板。',
          '集成音效系统：环境音效、响应式音效及位置音频，营造恐怖氛围。',
          '参与多轮迭代游玩测试，收集反馈并在各里程碑节点推进修复与优化。',
          '与美术、设计等成员协作，确保游戏玩法与创意方向保持一致。',
        ],
        techTags: ['Unity 2022', 'C#', 'Unity UI Toolkit', 'Unity Audio Mixer', 'GitHub', 'Jira'],
      },
      seo: '《Glass Ceiling》是一款使用 Unity 开发的恐怖解谜游戏，包含完整可玩的核心玩法程序、UI 系统、机制与音效整合。',
    },
  },

  {
    slug: 'what-remains-of-me',
    thumbClass: 'thumb-wrom',
    cardImage: { src: '/assets/images/what-remains-of-me/menu.webp', alt: 'What Remains Of Me', width: 1600, height: 888 },
    externalLink: { type: 'itch', url: 'https://whatremainsofme.itch.io/what-remains-of-me' },
    en: {
      title: 'What Remains Of Me',
      type: 'Game Dev &mdash; Class-wide Project',
      role: 'Game Developer',
      period: 'Sep &ndash; Dec 2025',
      thumbLabel: 'Unity · C# · Level Design',
      home: {
        desc: 'A cross-semester game developed by an entire class. Extended existing gameplay systems for smoother feature integration. Contributed to level design, art assets, and QA scripting. Tracked tasks with Jira to ensure consistent team delivery.',
        tags: ['Unity', 'C#', 'Level Design', 'Jira'],
      },
      listing: {
        desc: 'A cross-semester game developed by an entire class. Extended existing gameplay systems for smoother feature integration using Unity and C#. Contributed to gameplay programming, art assets, and level design. Tracked development tasks using Jira and wrote QA scripts to ensure functionality and smooth collaboration across the team.',
        tags: ['Unity', 'C#', 'Level Design', 'Jira', 'Gameplay Flow'],
      },
      detail: {
        pageEyebrow: '// Game Project &mdash; Level Design',
        overview: '<strong>What Remains Of Me</strong> is a cross-semester, narrative-driven game developed by an entire class at Northeastern University. The project focused on extending existing gameplay systems, shaping the world through level design, and ensuring quality through rigorous QA. Our group focus was revising <strong>Level 3</strong> and adding a clearer gameplay flow, making progression and player guidance more reasonable. My primary contribution was on the coding side of those updates.',
        tags: ['Unity', 'C#', 'Level Design', 'Art Assets', 'Jira', 'QA'],
        overviewImage: { src: '/assets/images/what-remains-of-me/menu.webp', alt: 'What Remains Of Me - Main Menu', overlay: false, width: 1600, height: 888 },
        gallery: [
          { src: '/assets/images/what-remains-of-me/menu.webp', alt: 'What Remains Of Me – Main Menu', width: 1600, height: 888 },
          { src: '/assets/images/what-remains-of-me/ingame1.webp', alt: 'What Remains Of Me – In-Game', width: 1600, height: 884 },
          { src: '/assets/images/what-remains-of-me/ingame2.webp', alt: 'What Remains Of Me – In-Game Scene 2', width: 1104, height: 710 },
          { src: '/assets/images/what-remains-of-me/ingame3.webp', alt: 'What Remains Of Me – In-Game Scene 3', width: 1600, height: 865 },
          { src: '/assets/images/what-remains-of-me/ingame4.webp', alt: 'What Remains Of Me – In-Game Scene 4', width: 1600, height: 859 },
        ],
        contributions: [
          'Implemented key code changes for the Level 3 rework, including progression logic and event sequencing.',
          'Built and integrated an added gameplay flow that made player objectives and transitions more coherent.',
          "Created and refined art assets to visually support the game's narrative tone.",
          'Collaborated with teammates on iteration and balancing, then shipped fixes quickly through Unity C# workflow.',
          'Wrote QA scripts to systematically test game functionality and catch regressions across builds.',
          'Used Jira to track tasks, manage sprint goals, and coordinate deliverables with the team.',
        ],
        techTags: ['Unity 2022', 'C#', 'ProBuilder', 'GitHub', 'Jira', 'Adobe Photoshop'],
      },
      seo: 'What Remains Of Me is a cross-semester, class-wide Unity game project featuring extended gameplay systems, level design, art contributions, and QA scripting.',
    },
    zh: {
      title: 'What Remains Of Me',
      type: '游戏开发 &mdash; 班级协作项目',
      role: '游戏开发者',
      period: '2025年9月 &ndash; 12月',
      thumbLabel: 'Unity · C# · 关卡设计',
      home: {
        desc: '这是一个跨学期由一整个班级共同开发的项目。扩展现有系统以实现更流畅的功能集成，参与游戏编程、美术资产与关卡设计。使用 Jira 追踪任务，编写 QA 测试脚本，保障团队协作质量。',
        tags: ['Unity', 'C#', '关卡设计', 'Jira'],
      },
      listing: {
        desc: '这是一个跨学期由一整个班级共同开发的项目。扩展现有系统以实现更流畅的功能集成，参与游戏编程、美术资产制作与关卡设计。使用 Jira 追踪开发任务，编写 QA 测试脚本，确保功能正常运行及团队协作顺畅。',
        tags: ['Unity', 'C#', '关卡设计', 'Jira', '游戏流程'],
      },
      detail: {
        pageEyebrow: '// 游戏项目 &mdash; 关卡设计',
        overview: '<strong>What Remains Of Me</strong> 是一个跨学期由一整个班级共同开发的叙事驱动游戏。项目聚焦于扩展现有游戏系统、通过关卡设计构建游戏世界，并以严格的 QA 测试确保整体质量。我们的主要工作是重做 <strong>Level 3</strong>，并新增一段更清晰的游戏流程，让玩家目标与推进节奏更合理。我的主要职责是这部分流程改造中的代码实现。',
        tags: ['Unity', 'C#', '关卡设计', '美术资产', 'Jira', 'QA'],
        overviewImage: { src: '/assets/images/what-remains-of-me/menu.webp', alt: 'What Remains Of Me - 主菜单', overlay: false, width: 1600, height: 888 },
        gallery: [
          { src: '/assets/images/what-remains-of-me/menu.webp', alt: 'What Remains Of Me – 主菜单', width: 1600, height: 888 },
          { src: '/assets/images/what-remains-of-me/ingame1.webp', alt: 'What Remains Of Me – 游戏内截图', width: 1600, height: 884 },
          { src: '/assets/images/what-remains-of-me/ingame2.webp', alt: 'What Remains Of Me – 游戏内截图 2', width: 1104, height: 710 },
          { src: '/assets/images/what-remains-of-me/ingame3.webp', alt: 'What Remains Of Me – 游戏内截图 3', width: 1600, height: 865 },
          { src: '/assets/images/what-remains-of-me/ingame4.webp', alt: 'What Remains Of Me – 游戏内截图 4', width: 1600, height: 859 },
        ],
        contributions: [
          '负责 Level 3 重做中的核心代码改动，包括推进逻辑、事件顺序与触发条件实现。',
          '实现并接入新增游戏流程，使玩家目标提示、区域切换与节奏衔接更连贯。',
          '制作并完善美术资产，在视觉上支撑游戏的叙事基调。',
          '与团队反复迭代流程手感与难度，并通过 Unity C# 快速落地修复与优化。',
          '编写 QA 测试脚本，系统性地测试游戏功能，捕捉各版本中的回归问题。',
          '使用 Jira 追踪任务、管理迭代目标，并与团队协调交付物。',
        ],
        techTags: ['Unity 2022', 'C#', 'ProBuilder', 'GitHub', 'Jira', 'Adobe Photoshop'],
      },
      seo: '《What Remains Of Me》是由整个班级跨学期共同开发的 Unity 游戏项目，涉及玩法系统扩展、关卡设计与 QA 脚本编写。',
    },
  },

  {
    slug: 'boston-tea-party',
    thumbClass: 'thumb-lum',
    cardImage: { src: '/assets/images/boston-tea-party/ingame1.webp', alt: 'Boston Tea Party', width: 1348, height: 784 },
    externalLink: { type: 'github', url: 'https://github.com/brandonius2/GAME3400_FinalProject_Group3' },
    en: {
      title: 'Boston Tea Party',
      type: 'Game Dev &mdash; Team Project',
      role: 'Level Designer &amp; Programmer',
      period: 'Nov 2025 &ndash; Dec 2025',
      thumbLabel: 'Unity · C# · Narrative Level Design',
      listing: {
        desc: 'Built a narrative-driven historical level in Unity where players carry tea crates and throw them into the harbor. Focused on mood, storytelling, and immersion through fog, lighting, environmental sound, and paced audio events.',
        tags: ['Unity', 'C#', 'Narrative Design', 'Level Design', 'GitHub'],
      },
      detail: {
        pageEyebrow: '// Game Project &mdash; Narrative Level Design',
        overview: 'This project is a narrative-driven level experience set during the Boston Tea Party. The player boards a British merchant ship, picks up tea crates, and throws them into the harbor. The simple action loop is used to highlight the emotional weight of the event. Fog, lantern lighting, environmental sounds, and timed audio clips slowly reveal themes of freedom, resistance, and the complexity of historical revolution.',
        tags: ['Unity', 'C#', 'Narrative Design', 'Level Design', 'Environmental Audio', 'Team Project'],
        overviewImage: { src: '/assets/images/boston-tea-party/ingame1.webp', alt: 'Boston Tea Party - In-Game', overlay: true, width: 1348, height: 784 },
        gallery: [
          { src: '/assets/images/boston-tea-party/ingame1.webp', alt: 'Boston Tea Party – In-Game 1', width: 1348, height: 784 },
          { src: '/assets/images/boston-tea-party/ingame2.webp', alt: 'Boston Tea Party – In-Game 2', width: 1396, height: 790 },
          { src: '/assets/images/boston-tea-party/ingame3.webp', alt: 'Boston Tea Party – In-Game 3', width: 1362, height: 776 },
        ],
        contributions: [
          'Designed and implemented the core gameplay loop in Unity, including picking up and throwing tea crates.',
          'Modeled and textured several environmental props used in the ship scene.',
          'Assisted scene layout and prop placement to guide player movement and focus.',
          'Applied level design pattern principles to support emotional storytelling and immersion.',
          'Implemented atmospheric setup with fog, lighting, and environment composition to strengthen tone.',
          'Coordinated gameplay pacing with audio clips, ambient sounds, and water-breathing effects for immersion.',
          'Collaborated on team iteration, playtesting, and environment polish.',
        ],
        techTags: ['Unity', 'C#', 'Object Interaction', 'Narrative Audio', 'Lighting &amp; Fog', 'Greybox Level Layout', 'GitHub', 'Trello', 'Figma'],
      },
      seo: 'Boston Tea Party is a narrative-driven historical Unity level focused on mood and storytelling through fog, lighting, environmental sound, and paced audio events.',
    },
    zh: {
      title: 'Boston Tea Party',
      type: '游戏开发 &mdash; 团队项目',
      role: '关卡设计师 &amp; 程序员',
      period: '2025年11月 &ndash; 12月',
      thumbLabel: 'Unity · C# · 叙事关卡设计',
      listing: {
        desc: '在 Unity 中完成叙事驱动的历史关卡体验。玩家在船上搬运茶箱并投向港口，通过重复交互感受事件意义。重点放在氛围与沉浸感，使用雾效、灯光、环境音与节奏化音频推进叙事。',
        tags: ['Unity', 'C#', '叙事设计', '关卡设计', 'GitHub'],
      },
      detail: {
        pageEyebrow: '// 游戏项目 &mdash; 叙事关卡设计',
        overview: '该项目是以"波士顿倾茶事件"为背景的叙事关卡体验。玩家扮演殖民地革命者，登上英国商船，搬起茶箱并将其投向港口。通过重复且有象征意义的交互，让玩家逐步体会历史事件的情绪和意义。通过雾效、灯光、环境音和分段音频，逐步传达"自由、反抗与历史复杂性"等主题，营造寒冷冬夜中的历史现场感。',
        tags: ['Unity', 'C#', '叙事设计', '关卡设计', '环境音频', '团队项目'],
        overviewImage: { src: '/assets/images/boston-tea-party/ingame1.webp', alt: 'Boston Tea Party - 游戏内截图', overlay: true, width: 1348, height: 784 },
        gallery: [
          { src: '/assets/images/boston-tea-party/ingame1.webp', alt: 'Boston Tea Party – 游戏内截图 1', width: 1348, height: 784 },
          { src: '/assets/images/boston-tea-party/ingame2.webp', alt: 'Boston Tea Party – 游戏内截图 2', width: 1396, height: 790 },
          { src: '/assets/images/boston-tea-party/ingame3.webp', alt: 'Boston Tea Party – 游戏内截图 3', width: 1362, height: 776 },
        ],
        contributions: [
          '在 Unity 中设计并实现核心玩法交互，形成"拾取茶箱 - 投掷入海"的主循环。',
          '建模并贴图了多个船体场景道具，支持整体环境表现。',
          '参与场景布局与道具摆放，帮助引导玩家路线与注意力。',
          '应用关卡设计模式，强化情绪表达与叙事沉浸。',
          '实现雾效、灯光与环境构图等氛围元素，增强关卡情绪张力。',
          '配合音频节奏整合环境音与叙事音频，提升沉浸感。',
          '与团队共同进行迭代、测试与场景打磨。',
        ],
        techTags: ['Unity', 'C#', '物体交互', '叙事音频', '灯光与雾效', '灰盒关卡布局', 'GitHub', 'Trello', 'Figma'],
      },
      seo: '《Boston Tea Party》是一个以叙事为核心的历史主题 Unity 关卡，通过雾效、灯光、环境音效与节奏化的音频事件营造氛围与代入感。',
    },
  },

  {
    slug: 'personal-website',
    thumbClass: 'thumb-web',
    cardIcon: '🌐',
    externalLink: { type: 'github', url: 'https://github.com/FF-Yan/ff-yan.github.io/' },
    en: {
      title: 'Personal Portfolio Website',
      type: 'Web Development &mdash; Solo',
      role: 'Developer',
      period: '2025 &ndash; Present',
      thumbLabel: 'HTML · CSS · JavaScript',
      listing: {
        desc: 'This very site — a clean, responsive, bilingual (EN / ZH) personal portfolio built with HTML, CSS, and vanilla JavaScript, hosted on GitHub Pages. Designed with a game-developer aesthetic in mind.',
        tags: ['HTML', 'CSS', 'JavaScript', 'GitHub Pages'],
      },
    },
    zh: {
      title: '个人作品集网站',
      type: '网页开发 &mdash; 独立项目',
      role: '开发者',
      period: '2025年 &ndash; 至今',
      thumbLabel: 'HTML · CSS · JavaScript',
      listing: {
        desc: '这个网站本身——一个简洁、响应式、支持中英双语的个人作品集，使用 HTML、CSS 和原生 JavaScript 构建，以游戏开发者视觉风格为设计理念，托管于 GitHub Pages。',
        tags: ['HTML', 'CSS', 'JavaScript', 'GitHub Pages'],
      },
    },
  },
];

// Slugs featured on the homepage, in display order.
const homeFeaturedSlugs = ['chromatic', 'glass-ceiling', 'what-remains-of-me'];

module.exports = { projects, homeFeaturedSlugs };
