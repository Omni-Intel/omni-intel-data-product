export const siteContent = {
  research: {
    title: "研究成果",
    description: "以公开论文和数据集记录实验方法、数据规模与可复现结果。",
  },
  order: {
    title: "把复杂的采集需求交给可靠的技术体系",
    description: "从研究设计到标准化数据交付",
  },
  contact: {
    email: "sales@omni-intel.cn",
    officialAccount: "深圳全域智能",
  },
} as const;

export const taskTypes = [
  {
    id: "execute",
    title: "按现有范式执行",
    description: "你已提供可直接执行的成熟实验范式，我们按范式组织并完成数据采集。",
    pricing: ["基础服务费", "数据采集费（按采集小时计费）"],
  },
  {
    id: "adjust",
    title: "现有范式调整",
    description: "你已有实验范式，但需要根据目标人群、设备、任务或交付要求进行修改。",
    pricing: ["基础服务费", "数据采集费（按采集小时计费）", "范式调整费（按投入工时计费）"],
  },
  {
    id: "design",
    title: "从需求设计范式",
    description: "你已有明确研究或业务需求，但尚未形成可执行的实验范式。",
    pricing: ["基础服务费", "数据采集费（按采集小时计费）", "范式设计与验证费（按投入工时计费）"],
    note: "第三类通常需要更完整的需求拆解、方案设计、预实验和验证，因此定制投入通常高于第二类。最终报价以需求评估为准。",
  },
] as const;
