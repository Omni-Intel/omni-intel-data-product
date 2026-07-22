export const papersSource = {
  url: "https://www.scidb.cn/InstitutionList?searchList&cssCode=o00147&ordernum=1",
  label: "ScienceDB",
} as const;

export type Paper = {
  year: number;
  title: string;
  journal: string;
  authors: string;
  url: string;
  images: readonly {
    src: string;
    width: number;
    height: number;
    fit: "width" | "height";
    scale?: number;
  }[];
};

export const papers: readonly Paper[] = [
  {
    year: 2025,
    title: "ChineseEEG-2: An EEG Dataset for Multimodal Semantic Alignment and Neural Decoding during Reading and Listening",
    journal: "arXiv",
    authors: "Sitong Chen; Beiqianyi Li; Cuilin He; Dongyang Li; Mingyang Wu; Xinke Shen; Song Wang; Xuetao Wei; Xindi Wang; Haiyan Wu; Quanying Liu",
    url: "https://arxiv.org/abs/2508.04240",
    images: [{ src: "/papers/chineseEEG2.webp", width: 902, height: 602, fit: "height" }],
  },
  {
    year: 2025,
    title: "A Multi-Context Emotional EEG Dataset for Cross-Context Emotion Decoding",
    journal: "Scientific Data",
    authors: "Xin Xu; Xinke Shen; Xuyang Chen; Qingzhu Zhang; Sitian Wang; Yihan Li; Zongsheng Li; Dan Zhang; Mingming Zhang; Quanying Liu",
    url: "https://www.nature.com/articles/s41597-025-05349-2",
    images: [{ src: "/papers/emotional-eeg.webp", width: 892, height: 444, fit: "width" }],
  },
  {
    year: 2024,
    title: "ChineseEEG: A Chinese Linguistic Corpora EEG Dataset for Semantic Alignment and Neural Decoding",
    journal: "Scientific Data",
    authors: "Xinyu Mou; Cuilin He; Liwei Tan; Junjie Yu; Huadong Liang; Jianyu Zhang; Yan Tian; Yu-Fang Yang; Ting Xu; Qing Wang; Miao Cao; Zijiao Chen; Chuan-Peng Hu; Xindi Wang; Quanying Liu; Haiyan Wu",
    url: "https://www.nature.com/articles/s41597-024-03398-7",
    images: [{ src: "/papers/chineseEEG.webp", width: 916, height: 706, fit: "height" }],
  },
  {
    year: 2025,
    title: "Multi-dataset Joint Pre-training of Emotional EEG Enables Generalizable Affective Computing",
    journal: "arXiv",
    authors: "Qingzhu Zhang; Jiani Zhong; Zongsheng Li; Xinke Shen; Quanying Liu",
    url: "https://arxiv.org/abs/2510.22197",
    images: [{ src: "/papers/multi-dataset-joint-pre-training.webp", width: 1600, height: 693, fit: "width", scale: 0.95 }],
  },
  {
    year: 2021,
    title: "EEGdenoiseNet: a benchmark dataset for deep learning solutions of EEG denoising",
    journal: "Journal of Neural Engineering",
    authors: "Haoming Zhang; Mingqi Zhao; Chen Wei; Dante Mantini; Zherui Li; Quanying Liu",
    url: "https://iopscience.iop.org/article/10.1088/1741-2552/ac2bf8/meta",
    images: [{ src: "/papers/EEGdenoiseNet.webp", width: 1128, height: 903, fit: "height" }],
  },
];
