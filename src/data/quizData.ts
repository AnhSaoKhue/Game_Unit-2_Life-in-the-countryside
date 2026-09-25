export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctText: string;
  explanation: string;
  vietnameseMeaning: string;
  grammarFocus: string;
}

export const RAW_QUESTIONS: Omit<QuizQuestion, 'id'>[] = [
  {
    question: "Farmers in my village often use a __________ to harvest rice quickly and separate grains automatically.",
    options: ["combine harvester", "tractor", "truck", "paddy field"],
    correctText: "combine harvester",
    explanation: "'combine harvester' nghĩa là máy gặt đập liên hợp (máy kết hợp gặt lúa và tuốt tách hạt tự động).",
    vietnameseMeaning: "Nông dân làng tôi thường dùng máy gặt đập liên hợp để thu hoạch lúa nhanh chóng và tách hạt tự động.",
    grammarFocus: "Từ vựng Unit 2 (Dụng cụ & máy móc nông nghiệp: combine harvester)"
  },
  {
    question: "My brother usually helps my uncle __________ the buffaloes in the pasture every afternoon.",
    options: ["herd", "load", "dry", "plough"],
    correctText: "herd",
    explanation: "Cụm từ cố định: 'herd buffaloes / herd cattle' nghĩa là chăn trâu / chăn bò.",
    vietnameseMeaning: "Anh trai tôi thường giúp chú tôi chăn trâu trên đồng cỏ vào mỗi buổi chiều.",
    grammarFocus: "Cụm động từ: herd buffaloes (chăn trâu)"
  },
  {
    question: "During __________ time, all villagers are busy cutting, gathering, and drying their crops.",
    options: ["harvest", "holiday", "festival", "vacation"],
    correctText: "harvest",
    explanation: "'harvest time' là mùa gặt / thời gian thu hoạch vụ mùa.",
    vietnameseMeaning: "Vào mùa gặt, tất cả dân làng đều bận rộn cắt, thu gom và phơi nông sản.",
    grammarFocus: "Từ vựng Unit 2: harvest time (vụ mùa, thời điểm thu hoạch)"
  },
  {
    question: "Life in the countryside moves more __________ than in a big bustling city.",
    options: ["slowly", "slower", "slow", "slight"],
    correctText: "slowly",
    explanation: "Động từ thường 'moves' cần trạng từ bổ nghĩa. Trạng từ dài 'slowly' có dạng so sánh hơn là 'more slowly'.",
    vietnameseMeaning: "Nhịp sống ở nông thôn trôi qua chậm rãi hơn so với một thành phố lớn nhộn nhịp.",
    grammarFocus: "Ngữ pháp: Comparative forms of adverbs (So sánh hơn của trạng từ dài: more + adv)"
  },
  {
    question: "The children helped their parents __________ the rice sacks onto the truck.",
    options: ["load", "unload", "catch", "milk"],
    correctText: "load",
    explanation: "'load ... onto ...' có nghĩa là chất / bốc hàng hóa lên xe. (Ngược lại là 'unload' - dỡ hàng xuống).",
    vietnameseMeaning: "Bọn trẻ đã giúp bố mẹ bốc những bao lúa lên xe tải.",
    grammarFocus: "Động từ hành động: load (chất lên) vs unload (dỡ xuống)"
  },
  {
    question: "After school, village kids like running to the expansive __________ field to fly kites.",
    options: ["paddy", "cattle", "pig", "poultry"],
    correctText: "paddy",
    explanation: "'paddy field' là cánh đồng lúa nước (đặc trưng nổi bật của làng quê Việt Nam).",
    vietnameseMeaning: "Sau giờ học, trẻ em trong làng thích chạy ra cánh đồng lúa bao la để thả diều.",
    grammarFocus: "Cụm danh từ: paddy field (cánh đồng lúa)"
  },
  {
    question: "In the evening, country kids enjoy playing traditional games like __________ dancing.",
    options: ["bamboo", "wood", "flower", "river"],
    correctText: "bamboo",
    explanation: "'bamboo dancing' là múa sạp / nhảy sạp (trò chơi và điệu múa dân gian truyền thống sử dụng các thanh tre).",
    vietnameseMeaning: "Vào buổi tối, trẻ em thôn quê rất thích chơi các trò chơi dân gian như nhảy sạp.",
    grammarFocus: "Trò chơi dân gian: bamboo dancing (nhảy sạp)"
  },
  {
    question: "People in rural areas usually lead a __________ lifestyle because of fresh air and nature.",
    options: ["healthier", "busier", "noisier", "dirtier"],
    correctText: "healthier",
    explanation: "'healthy' chuyển sang so sánh hơn thành 'healthier'. 'healthier lifestyle' nghĩa là lối sống lành mạnh hơn.",
    vietnameseMeaning: "Người dân ở vùng nông thôn thường có lối sống lành mạnh hơn nhờ không khí trong lành và thiên nhiên.",
    grammarFocus: "So sánh hơn của tính từ 2 âm tiết kết thúc bằng 'y': healthy -> healthier"
  },
  {
    question: "Farmers spread out harvested rice on the concrete road for __________ under the bright sun.",
    options: ["drying", "milking", "feeding", "ploughing"],
    correctText: "drying",
    explanation: "Sau giới từ 'for' dùng V-ing. 'drying' mang nghĩa là phơi khô (lúa, ngô, nông sản).",
    vietnameseMeaning: "Người nông dân rải lúa đã thu hoạch ra mặt đường bê tông để phơi dưới ánh nắng rực rỡ.",
    grammarFocus: "Từ vựng hành động nông nghiệp: dry -> drying (phơi khô)"
  },
  {
    question: "'What are the farmers doing over there?' - 'They are __________ fields with buffaloes.'",
    options: ["ploughing", "feeding", "catching", "herding"],
    correctText: "ploughing",
    explanation: "'ploughing fields' nghĩa là cày ruộng. Thì hiện tại tiếp diễn: are + ploughing.",
    vietnameseMeaning: "'Các bác nông dân đằng kia đang làm gì vậy?' - 'Họ đang cày ruộng cùng với những chú trâu.'",
    grammarFocus: "Từ vựng: plough fields (cày ruộng) & thì Hiện tại tiếp diễn"
  }
];
