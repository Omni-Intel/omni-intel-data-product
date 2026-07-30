export const datasetCollection = {
  name: "汉脑交响",
  url: "https://www.scidb.cn/c/o00147",
  downloads: "27+万",
  datasets: [
    {
      name: "EmoEEG-MC",
      description: "多情境情绪脑电数据集",
      year: "2025",
      downloads: "15+万",
      url: "https://www.scidb.cn/detail?dataSetId=9b182864c9604255a0433d1edae88f0b&version=V6&code=o00147",
    },
    {
      name: "ChineseEEG",
      description: "面向语义对齐与神经解码的中文语料脑电数据集",
      year: "2024",
      downloads: "8+万",
      url: "https://doi.org/10.57760/sciencedb.CHNNeuro.00007",
    },
    {
      name: "ChineseEEG-2",
      description: "阅读与聆听任务中的多模态语义对齐与神经解码脑电数据集",
      year: "2025",
      downloads: "3+万",
      url: "https://doi.org/10.57760/sciencedb.CHNNeuro.00001",
    },
  ],
} as const;

export const serviceContent = {
  lead: "面向大脑基座模型、科学研究与智能体交互，提供以脑电为核心，结合肌电、眼动、行为、任务与环境信息的多模态数据采集、处理、标注与结构化交付服务",
  narrative: {
    title: "以规模化大脑数采和大脑基座模型为核心，帮助下一代AI理解人类的价值判断、内在状态与个体偏好",
    paragraphs: [
      "通过采集和解析脑电等神经信号，将人的注意、意图、情绪、疲劳和错误感知转化为AI可使用的信息。",
      "让AI在训练阶段学习人的判断与偏好，在使用过程中持续理解人的状态并作出响应。",
      "在数据层上提供包括采集、去噪、脑电溯源、大脑的数字孪生在内的全链路技术。",
    ],
  },
  dataTypes: [
    { title: "神经与生理信号", items: ["脑电", "肌电等"] },
    { title: "眼动与行为数据", items: ["眼动", "人体与手部动作", "操作与交互过程", "行为结果"] },
    { title: "任务与场景上下文", items: ["任务指令", "任务状态", "视觉与听觉刺激", "环境状态"] },
  ],
  applications: [
    { title: "科学研究", description: "为认知神经科学与脑机接口研究提供可复用的数据和实验记录。", uses: ["认知研究", "脑机接口", "数据集建设"] },
    { title: "大脑基座模型", description: "为支持跨被试泛化、多任务复用的模型预训练、后训练与下游验证，提供覆盖广且分布匹配的数据基础。", uses: ["预训练", "后训练", "下游验证"] },
    { title: "智能体与机器人", description: "将神经信号与任务指令、环境状态等物理世界上下文结合，帮助智能体和机器人感知人的状态、理解人的意图并作出响应。", uses: ["状态感知", "意图理解", "交互响应"] },
  ],
} as const;
