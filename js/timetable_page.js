document.addEventListener('DOMContentLoaded', () => {
    const semesterGridIds = {
        '1q_1sem': 'timetable-grid-body-1sem',
        '2q_2sem': 'timetable-grid-body-2sem'
    };
    const semesterLabels = {
        '1q_1sem': '1年次第1学期（1セメ）',
        '2q_2sem': '1年次第2学期（2セメ）'
    };
    const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri'];
    const dayLabels = { mon: '月', tue: '火', wed: '水', thu: '木', fri: '金' };

    const resetBtn = document.getElementById('reset-timetable');
    const downloadBtn = document.getElementById('download-timetable-pdf');
    const creditSummary = document.getElementById('credit-summary');
    const selectedCourseList = document.getElementById('selected-course-list');
    const note = document.getElementById('timetable-data-note');
    const toggleMobilePreviewBtn = document.getElementById('toggle-mobile-preview');
    const mobilePreviewBody = document.getElementById('mobile-preview-body');
    const mobilePreviewGrid = document.getElementById('mobile-preview-grid');
    const previewSemesterButtons = document.querySelectorAll('.preview-semester-btn');

    const storageKey = 'tohoku_med_semester_selections_v2';
    const syllabusYear = '2026';
    let currentPreviewSemester = '1q_1sem';

    const primaryCreditRequirements = [
        { key: 'overall', label: '全学教育科目 合計', required: 39 },
        { key: 'foundationTotal', label: '基盤科目 合計（選択必修含む）', required: 11 },
        { key: 'advancedTotal', label: '先進科目 合計（選択必修含む）', required: 2 },
        { key: 'languageTotal', label: '言語科目 合計（選択必修含む）', required: 10 },
        { key: 'academicTotal', label: '学術基礎科目 合計（選択必修含む）', required: 16 }
    ];

    const detailCreditRequirements = [
        { key: 'foundationRequired', label: '基盤科目必修（学問論/自然科学総合実験/スポーツA）', required: 5 },
        { key: 'foundationHuman', label: '基盤科目 人文科学（2単位以上）', required: 2 },
        { key: 'foundationSocial', label: '基盤科目 社会科学（2単位以上）', required: 2 },
        { key: 'advancedRequired', label: '先進科目必修（情報とデータの基礎）', required: 2 },
        { key: 'languageEnglish', label: '言語科目 英語', required: 6 },
        { key: 'languageInitial', label: '言語科目 初修語', required: 4 },
        { key: 'academicRequired', label: '学術基礎科目必修（生命科学B/C）', required: 4 }
    ];

    const courses = [
        { code: 'CB13101', name: '学問論', credits: 2, category: '基盤科目', requirementTags: ['foundationRequired'], semesters: ['1q_1sem'], slots: [{ day: 'mon', period: 3 }, { day: 'mon', period: 4 }, { day: 'mon', period: 5 }], requiredByDefault: true },
        { code: 'CB43105', name: '自然科学総合実験', credits: 2, category: '基盤科目', requirementTags: ['foundationRequired'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 3 }, { day: 'thu', period: 4 }], requiredByDefault: true },
        { code: 'CB32110', name: 'スポーツA', credits: 1, category: '基盤科目', requirementTags: ['foundationRequired'], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 2 }], requiredByDefault: true },
        { code: 'CB23106', name: '情報とデータの基礎', credits: 2, category: '先進科目', requirementTags: ['advancedRequired'], semesters: ['1q_1sem'], slots: [{ day: 'tue', period: 3 }], requiredByDefault: true },
        { code: 'CB22128', name: '英語I-A', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['1q_1sem'], slots: [{ day: 'tue', period: 2 }], requiredByDefault: true },
        { code: 'CB51113', name: '英語I-B', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['1q_1sem'], slots: [{ day: 'fri', period: 1 }], requiredByDefault: true },
        { code: 'CB33114', name: '基礎ドイツ語I', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33119', name: '基礎フランス語I', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33122', name: '基礎スペイン語I', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33124', name: '基礎中国語I', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB25114', name: '基礎ロシア語I', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['1q_1sem'], slots: [{ day: 'tue', period: 5 }, { day: 'fri', period: 5 }] },
        { code: 'CB25116', name: '基礎朝鮮語I', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['1q_1sem'], slots: [{ day: 'tue', period: 5 }, { day: 'fri', period: 5 }] },
        { code: 'CB41111', name: '生命科学B', credits: 2, category: '学術基礎科目', requirementTags: ['academicRequired'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 1 }], requiredByDefault: true },
        { code: 'CB54101', name: '生命科学C', credits: 2, category: '学術基礎科目', requirementTags: ['academicRequired'], semesters: ['1q_1sem'], slots: [{ day: 'fri', period: 4 }], requiredByDefault: true },
        { code: 'CB21101', name: '物理学概論I', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'tue', period: 1 }] },
        { code: 'CB31103', name: '化学A', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 1 }] },
        { code: 'CB31101', name: '線形代数学概論', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 1 }] },
        { code: 'CB52101', name: '数理統計学概論', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'fri', period: 2 }] },
        { code: 'CB42101', name: '論理学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 2 }] },
        { code: 'CB42103', name: '倫理学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 2 }] },
        { code: 'CB42105', name: '歴史学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 2 }] },
        { code: 'CB42109', name: '社会学', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 2 }] },
        { code: 'CB42111', name: '経済と社会', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 2 }] },
        { code: 'CB42113', name: '法学', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 2 }] },
        { code: 'CB42114', name: '政治学', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 2 }] },
        { code: 'CB24105', name: '生命科学A', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'tue', period: 4 }] },
        { code: 'CB34104', name: '国際事情', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 4 }] },
        { code: 'CB25102', name: '多文化間コミュニケーション', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 4 }] },
        { code: 'CB34105', name: '流体力学の基礎', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 4 }] },
        { code: 'CB35101', name: '多文化間コミュニケーション', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 4 }] },
        { code: 'CB35102', name: 'グローバルPBL', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 4 }] },
        { code: 'CB35103', name: '海の自然災害と防災・減災', credits: 2, category: '先進科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 4 }] },
        { code: 'CB35104', name: 'イタリア語I', credits: 2, category: '言語科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 4 }] },
        { code: 'CB33111', name: '文化と社会の探求', credits: 2, category: '先進科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'wed', period: 3 }, { day: 'thu', period: 1 }] },
        { code: 'CB55101', name: '実践的機械学習I', credits: 2, category: '先進科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'fri', period: 5 }] },
        { code: 'CB45101', name: '情報教育特別講義', credits: 2, category: '先進科目', requirementTags: [], semesters: ['1q_1sem'], slots: [{ day: 'thu', period: 5 }] },
        { code: 'CB13203', name: '英語II-A', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 3 }], requiredByDefault: true },
        { code: 'CB13204', name: '英語II-A', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 3 }] },
        { code: 'CB13205', name: '英語II-A', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 3 }] },
        { code: 'CB13213', name: '英語II-A', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 3 }] },
        { code: 'CB54202', name: '英語II-B', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 4 }], requiredByDefault: true },
        { code: 'CB54203', name: '英語II-B', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 4 }] },
        { code: 'CB54204', name: '英語II-B', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 4 }] },
        { code: 'CB54205', name: '英語II-B', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 4 }] },
        { code: 'CB54206', name: '英語II-B', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 4 }] },
        { code: 'CB54207', name: '英語II-B', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 4 }] },
        { code: 'CB23238', name: '経済学入門B', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 1 }] },
        { code: 'CB32201', name: '解析学概論', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 1 }] },
        { code: 'CB32202', name: '解析学概論', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 1 }] },
        { code: 'CB32203', name: '解析学概論', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 1 }] },
        { code: 'CB32204', name: '解析学概論', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 1 }] },
        { code: 'CB31201', name: '哲学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31202', name: '倫理学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31203', name: '文学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31204', name: '芸術', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31205', name: '芸術', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31206', name: '歴史学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31207', name: '言語学・日本語科学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31208', name: '心理学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31209', name: '心理学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31210', name: '文化人類学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31211', name: '法学', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31212', name: '政治学', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31215', name: 'インクルージョン社会', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31216', name: 'エネルギーや資源と持続可能性', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31217', name: '生命と自然', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31218', name: '自然と環境', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB31219', name: '情報と人間・社会', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB24202', name: '物理学概論II', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 4 }] },
        { code: 'CB25201', name: 'データ科学・AI概論', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 4 }] },
        { code: 'CB25214', name: '基礎ロシア語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 5 }, { day: 'fri', period: 5 }] },
        { code: 'CB25216', name: '基礎朝鮮語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 5 }, { day: 'fri', period: 5 }] },
        { code: 'CB25217', name: '基礎朝鮮語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 5 }, { day: 'fri', period: 5 }] },
        { code: 'CB33220', name: '基礎ドイツ語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33221', name: '基礎ドイツ語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33222', name: '基礎ドイツ語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33223', name: '基礎ドイツ語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33224', name: '基礎ドイツ語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33225', name: '基礎フランス語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33226', name: '基礎フランス語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33227', name: '基礎フランス語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33228', name: '基礎スペイン語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33229', name: '基礎スペイン語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33230', name: '基礎中国語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33231', name: '基礎中国語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33232', name: '基礎中国語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB33233', name: '基礎中国語II', credits: 2, category: '言語科目', requirementTags: ['languageInitial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 3 }, { day: 'fri', period: 3 }] },
        { code: 'CB35202', name: '情報教育特別講義（統計数理モデリング）', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 5 }] },
        { code: 'CB34203', name: 'AI、IoT時代の公共ポリシーを国際的な観点から考察する', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 4 }] },
        { code: 'CB35201', name: '東北アジア地域研究入門', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 4 }] },
        { code: 'CB35203', name: '文化と社会の探求', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 4 }] },
        { code: 'CB35204', name: 'グローバル学習', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 4 }] },
        { code: 'CB35205', name: 'グローバルPBL', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 4 }] },
        { code: 'CB35206', name: 'ユーラシア大陸を考える', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 4 }] },
        { code: 'CB35207', name: 'イタリア語II', credits: 2, category: '言語科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 4 }] },
        { code: 'CB42207', name: '国際教養特定課題', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 5 }] },
        { code: 'CB42208', name: '文化理解', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 5 }] },
        { code: 'CB42209', name: '文化理解', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 5 }] },
        { code: 'CB42211', name: 'グローバルPBL', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 5 }] },
        { code: 'CB42223', name: '日本語B', credits: 2, category: '言語科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 5 }] },
        { code: 'CB42224', name: '教育課程論', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 5 }] },
        { code: 'CB43213', name: '国際事情', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 3 }] },
        { code: 'CB43214', name: '国際教養PBL', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 3 }] },
        { code: 'CB43230', name: '多文化特定課題', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 3 }] },
        { code: 'CB43228', name: '読んで書いて話す', credits: 2, category: '言語科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 3 }] },
        { code: 'CB43227', name: '日本語H', credits: 2, category: '言語科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 3 }] },
        { code: 'CB44203', name: '国際教養PBL', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 4 }] },
        { code: 'CB44204', name: '多文化PBL', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 4 }] },
        { code: 'CB44206', name: '教育の制度と経営', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 4 }] },
        { code: 'CB42210', name: '多文化特定課題', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'thu', period: 2 }] },
        { code: 'CB45201', name: '情報教育特別講義（AIをめぐる人間と社会）', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'thu', period: 5 }] },
        { code: 'CB45204', name: '福島の復興・再生', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 5 }] },
        { code: 'CB45205', name: '物理の思想と美学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 5 }] },
        { code: 'CB45206', name: '物理学の最前線と現代社会、そして未来社会', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 5 }] },
        { code: 'CB45208', name: 'アラビア語II', credits: 2, category: '言語科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 5 }] },
        { code: 'CB45209', name: '多文化PBL', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 4 }] },
        { code: 'CB45207', name: '多文化特定課題', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 4 }] },
        { code: 'CB53207', name: '国際事情', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 5 }] },
        { code: 'CB53208', name: '多文化PBL', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 5 }] },
        { code: 'CB55202', name: '実践的機械学習II', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 4 }] },
        { code: 'CB55201', name: '日本国憲法', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 5 }] },
        { code: 'CB55203', name: '文化理解', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 5 }] },
        { code: 'CB55204', name: '多文化間コミュニケーション', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 5 }] },
        { code: 'CB55205', name: '汎用的技能ワークショップ', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 5 }] },
        { code: 'CB55206', name: 'キャリア教育特別講義（ジャーナリズムと社会）', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 5 }] },
        { code: 'CB55207', name: 'キャリア教育特別講義（口腔保健学総論）', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 5 }] },
        { code: 'CB55210', name: 'SDGs入門', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 5 }] },
        { code: 'CB55211', name: 'アルゴリズミック思考の基礎', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 5 }] },
        { code: 'CB13206', name: '英語II-A', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 3 }] },
        { code: 'CB13214', name: '英語II-A', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 3 }] },
        { code: 'CB13215', name: '英語II-A', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 3 }] },
        { code: 'CB13216', name: '英語II-A', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 3 }] },
        { code: 'CB13217', name: '英語II-A', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 3 }] },
        { code: 'CB13218', name: '英語II-A', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 3 }] },
        { code: 'CB13219', name: '英語II-A', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 3 }] },
        { code: 'CB14204', name: '伝統文化と哲学', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 4 }] },
        { code: 'CB14212', name: '現代経済法の基礎理論', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 4 }] },
        { code: 'CB14213', name: '現代経済法の基礎理論', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 4 }] },
        { code: 'CB15201', name: 'ナノ・マイクロ科学概論', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 5 }] },
        { code: 'CB15202', name: '汎用的技能ワークショップ', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 5 }] },
        { code: 'CB15203', name: '多文化特定課題', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 5 }] },
        { code: 'CB15204', name: 'グローバル特定課題', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 5 }] },
        { code: 'CB15206', name: 'Jヴィレッジ訪問', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 5 }] },
        { code: 'CB15207', name: 'キャリアデザインA', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 5 }] },
        { code: 'CB15208', name: '数理統計学概論', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'mon', period: 5 }] },
        { code: 'CB23206', name: '日本国憲法', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 3 }] },
        { code: 'CB23207', name: '文化と社会の探求', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 3 }] },
        { code: 'CB23208', name: '多文化間コミュニケーション', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 3 }] },
        { code: 'CB23209', name: '多文化PBL', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 3 }] },
        { code: 'CB23210', name: 'グローバル特定課題', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 3 }] },
        { code: 'CB24206', name: '天文学概論', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 4 }] },
        { code: 'CB24207', name: '数理統計学概論', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 4 }] },
        { code: 'CB24212', name: '現代経済法の基礎理論', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 4 }] },
        { code: 'CB24213', name: '多文化社会の探求', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'tue', period: 4 }] },
        { code: 'CB31220', name: '経済学入門A', credits: 2, category: '基盤科目（社会科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 1 }] },
        { code: 'CB31229', name: '物理学概論', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 1 }] },
        { code: 'CB32207', name: '物理学概論', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB32208', name: '化学基礎論', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB32209', name: '解析学概論', credits: 2, category: '学術基礎科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB32210', name: '文化理解', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 2 }] },
        { code: 'CB34201', name: '多文化PBL', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 4 }] },
        { code: 'CB34204', name: 'キャリア関連', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 4 }] },
        { code: 'CB34205', name: '日本文化論', credits: 2, category: '基盤科目（人文科学）', requirementTags: ['foundationHumanSocial'], semesters: ['2q_2sem'], slots: [{ day: 'wed', period: 4 }] },
        { code: 'CB54208', name: '英語II-B', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 4 }] },
        { code: 'CB54209', name: '英語II-B', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 4 }] },
        { code: 'CB54210', name: '英語II-B', credits: 1, category: '言語科目', requirementTags: ['languageEnglish'], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 4 }] },
        { code: 'CB55212', name: 'グローバルリーダーシップ論', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 5 }] },
        { code: 'CB55213', name: 'アントレプレナーシップ思考', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 5 }] },
        { code: 'CB55214', name: 'グローバル特定課題', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 5 }] },
        { code: 'CB55215', name: '体育学のすすめ', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 5 }] },
        { code: 'CB55216', name: 'SDGs入門', credits: 2, category: '基盤科目（学際科目）', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 5 }] },
        { code: 'CB55217', name: 'アルゴリズミック思考の基礎', credits: 2, category: '先進科目', requirementTags: [], semesters: ['2q_2sem'], slots: [{ day: 'fri', period: 5 }] }
    ];

    const linkedInitialLanguageMap = {
        CB33114: 'CB33220', CB33220: 'CB33114', CB33221: 'CB33114', CB33222: 'CB33114', CB33223: 'CB33114', CB33224: 'CB33114',
        CB33119: 'CB33225', CB33225: 'CB33119', CB33226: 'CB33119', CB33227: 'CB33119',
        CB33122: 'CB33228', CB33228: 'CB33122', CB33229: 'CB33122',
        CB33124: 'CB33230', CB33230: 'CB33124', CB33231: 'CB33124', CB33232: 'CB33124', CB33233: 'CB33124',
        CB25114: 'CB25214', CB25214: 'CB25114', CB25116: 'CB25216', CB25216: 'CB25116', CB25217: 'CB25116'
    };
    const lockedSlotsBySemester = {
        '1q_1sem': {
            'mon-1': '専門科目（医学医療入門）',
            'mon-2': '専門科目（医学医療入門）'
        },
        '2q_2sem': {
            'tue-1': '専門科目（医学医療入門）',
            'tue-2': '専門科目（医学医療入門）',
            'thu-1': '専門科目',
            'thu-2': '専門科目',
            'thu-3': '専門科目',
            'thu-4': '専門科目',
            'fri-1': '専門科目',
            'fri-2': '専門科目'
        }
    };

    const semesterSelections = { '1q_1sem': {}, '2q_2sem': {} };

    function getGridBody(semesterKey) {
        return document.getElementById(semesterGridIds[semesterKey]);
    }
    function getCellKey(day, period) {
        return `${day}-${period}`;
    }
    function getLockedSlotLabel(semesterKey, day, period) {
        const key = getCellKey(day, period);
        return lockedSlotsBySemester[semesterKey]?.[key] || '';
    }
    function getCourseByCode(code) {
        return courses.find(c => c.code === code);
    }
    function getCoursesForSemester(semesterKey) {
        return courses.filter(c => c.semesters.includes(semesterKey));
    }
    function getCoursesForSlot(semesterKey, day, period) {
        return getCoursesForSemester(semesterKey).filter(c => Array.isArray(c.slots) && c.slots.some(s => s.day === day && s.period === period));
    }
    function getSyllabusUrl(code) {
        return `https://qsl.cds.tohoku.ac.jp/qsl/syllabus/display/${code.toLowerCase()}-${syllabusYear}`;
    }
    function getCategoryClass(course) {
        if (!course || !course.category) return '';
        if (course.category.startsWith('基盤科目')) return 'cat-foundation';
        if (course.category.startsWith('先進科目')) return 'cat-advanced';
        if (course.category.startsWith('言語科目')) return 'cat-language';
        if (course.category.startsWith('学術基礎科目')) return 'cat-academic';
        return 'cat-other';
    }
    function getOptionInlineStyle(course) {
        const cls = getCategoryClass(course);
        if (cls === 'cat-foundation') return 'background:#fff4dd;color:#2b2b2b;';
        if (cls === 'cat-advanced') return 'background:#eaf6ff;color:#2b2b2b;';
        if (cls === 'cat-language') return 'background:#eaf9ec;color:#2b2b2b;';
        if (cls === 'cat-academic') return 'background:#f2edff;color:#2b2b2b;';
        return 'background:#f4f6f8;color:#2b2b2b;';
    }
    function getCategoryMarker(course) {
        const cls = getCategoryClass(course);
        if (cls === 'cat-foundation') return '🟨';
        if (cls === 'cat-advanced') return '🟦';
        if (cls === 'cat-language') return '🟩';
        if (cls === 'cat-academic') return '🟪';
        return '⬜';
    }

    function persistSelections() {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(semesterSelections));
        } catch (e) {
            console.warn('failed to persist selections', e);
        }
    }

    function loadSelections() {
        try {
            const raw = window.localStorage.getItem(storageKey);
            if (!raw) return;
            const data = JSON.parse(raw);
            semesterSelections['1q_1sem'] = data['1q_1sem'] || {};
            semesterSelections['2q_2sem'] = data['2q_2sem'] || {};
        } catch (e) {
            console.warn('failed to load selections', e);
        }
    }

    function createOptionsHtml(list) {
        let html = '<option value="" style="background:#ffffff;color:#2b2b2b;">（未選択）</option>';
        list.forEach(c => {
            html += `<option value="${c.code}" style="${getOptionInlineStyle(c)}">${getCategoryMarker(c)} ${c.name}（${c.code}） / ${c.credits}単位 / ${c.category}</option>`;
        });
        return html;
    }

    function applySavedSelections(semesterKey) {
        const tbody = getGridBody(semesterKey);
        const saved = semesterSelections[semesterKey] || {};
        Object.keys(saved).forEach(key => {
            const [day, period] = key.split('-');
            const select = tbody.querySelector(`.timetable-select[data-day="${day}"][data-period="${period}"]`);
            if (!select) return;
            const code = saved[key];
            if (code && select.querySelector(`option[value="${code}"]`)) {
                select.value = code;
            }
        });
    }

    function applyDefaultRequiredSelections(semesterKey) {
        const tbody = getGridBody(semesterKey);
        const requiredCourses = getCoursesForSemester(semesterKey).filter(c => c.requiredByDefault);

        requiredCourses.forEach(course => {
            const slots = course.slots || [];
            let assignedAny = false;

            slots.forEach(slot => {
                const select = tbody.querySelector(`.timetable-select[data-day="${slot.day}"][data-period="${slot.period}"]`);
                if (!select) return;
                if (!select.querySelector(`option[value="${course.code}"]`)) return;
                if (select.value === '') {
                    select.value = course.code;
                    assignedAny = true;
                }
            });

            if (assignedAny) return;

            const fallback = Array.from(tbody.querySelectorAll('.timetable-select'))
                .find(s => s.value === '' && s.querySelector(`option[value="${course.code}"]`));
            if (fallback) fallback.value = course.code;
        });
    }

    function saveSemesterSelection(semesterKey) {
        const tbody = getGridBody(semesterKey);
        const next = {};
        tbody.querySelectorAll('.timetable-select').forEach(select => {
            next[getCellKey(select.dataset.day, select.dataset.period)] = select.value || '';
        });
        semesterSelections[semesterKey] = next;
        persistSelections();
    }

    function setCourseSelection(courseCode, shouldSelect) {
        const course = getCourseByCode(courseCode);
        if (!course) return;
        const semesterKey = course.semesters[0];
        const tbody = getGridBody(semesterKey);
        if (!tbody) return;

        const slotSelects = Array.from(tbody.querySelectorAll('.timetable-select'))
            .filter(s => s.querySelector(`option[value="${courseCode}"]`));

        if (!shouldSelect) {
            slotSelects.forEach(select => {
                if (select.value === courseCode) select.value = '';
            });
            saveSemesterSelection(semesterKey);
            return;
        }

        if (slotSelects.length === 0) return;
        slotSelects.forEach(select => {
            select.value = courseCode;
        });
        saveSemesterSelection(semesterKey);
    }

    function syncMultiSlotCourse(semesterKey, changedSelect, prevCode, currentCode) {
        const tbody = getGridBody(semesterKey);
        if (!tbody) return;

        const clearOtherSlotsFor = (courseCode) => {
            if (!courseCode) return;
            const selects = Array.from(tbody.querySelectorAll('.timetable-select'))
                .filter(s => s !== changedSelect && s.value === courseCode);
            selects.forEach(s => {
                s.value = '';
            });
        };

        const fillOtherSlotsFor = (courseCode) => {
            if (!courseCode) return;
            const selects = Array.from(tbody.querySelectorAll('.timetable-select'))
                .filter(s => s !== changedSelect && s.querySelector(`option[value="${courseCode}"]`));
            selects.forEach(s => {
                s.value = courseCode;
            });
        };

        if (prevCode && prevCode !== currentCode) {
            clearOtherSlotsFor(prevCode);
        }
        fillOtherSlotsFor(currentCode);
    }

    function syncLinkedInitialLanguage(prevCode, currentCode) {
        const prevLinked = linkedInitialLanguageMap[prevCode];
        const currentLinked = linkedInitialLanguageMap[currentCode];
        if (prevLinked && prevLinked !== currentLinked) setCourseSelection(prevLinked, false);
        if (currentLinked) setCourseSelection(currentLinked, true);
    }

    function bindGridEvents(semesterKey) {
        const tbody = getGridBody(semesterKey);
        const setActiveCell = (select) => {
            document.querySelectorAll('.timetable-cell.is-active-cell').forEach(cell => {
                cell.classList.remove('is-active-cell');
            });
            select.closest('.timetable-cell')?.classList.add('is-active-cell');
        };

        tbody.querySelectorAll('.timetable-select').forEach(select => {
            select.dataset.prev = select.value || '';
            select.addEventListener('focus', () => setActiveCell(select));
            select.addEventListener('click', () => setActiveCell(select));
            select.addEventListener('change', () => {
                const prevCode = select.dataset.prev || '';
                const currentCode = select.value || '';
                syncMultiSlotCourse(semesterKey, select, prevCode, currentCode);
                syncLinkedInitialLanguage(prevCode, currentCode);
                select.dataset.prev = currentCode;
                saveSemesterSelection(semesterKey);
                updateCellCategoryStyles(semesterKey);
                updateSummary();
            });
        });
    }

    function updateCellCategoryStyles(semesterKey) {
        const tbody = getGridBody(semesterKey);
        if (!tbody) return;
        const classNames = ['cat-foundation', 'cat-advanced', 'cat-language', 'cat-academic', 'cat-other'];
        tbody.querySelectorAll('.timetable-cell').forEach(td => {
            td.classList.remove(...classNames);
            const select = td.querySelector('.timetable-select');
            if (!select) return;
            const course = getCourseByCode(select.value || '');
            const categoryClass = getCategoryClass(course);
            if (categoryClass) td.classList.add(categoryClass);
        });
    }

    function renderSemesterGrid(semesterKey) {
        const tbody = getGridBody(semesterKey);
        if (!tbody) return;

        let html = '';
        for (let period = 1; period <= 5; period += 1) {
            html += `<tr><td>${period}</td>`;
            dayKeys.forEach(day => {
                const lockedLabel = getLockedSlotLabel(semesterKey, day, period);
                if (lockedLabel) {
                    html += `<td class="locked-slot-cell"><span class="locked-slot-label">${lockedLabel}</span></td>`;
                    return;
                }
                const options = createOptionsHtml(getCoursesForSlot(semesterKey, day, period));
                html += `<td class="timetable-cell"><select class="timetable-select" data-semester="${semesterKey}" data-day="${day}" data-period="${period}">${options}</select></td>`;
            });
            html += '</tr>';
        }
        tbody.innerHTML = html;

        applySavedSelections(semesterKey);
        applyDefaultRequiredSelections(semesterKey);
        saveSemesterSelection(semesterKey);
        updateCellCategoryStyles(semesterKey);
        bindGridEvents(semesterKey);
    }

    function getSelectedCoursesForSemester(semesterKey) {
        const saved = semesterSelections[semesterKey] || {};
        const codes = new Set(Object.values(saved).filter(Boolean));
        return Array.from(codes).map(getCourseByCode).filter(Boolean);
    }

    function getSelectedCourseAt(semesterKey, day, period) {
        if (getLockedSlotLabel(semesterKey, day, period)) return null;
        const saved = semesterSelections[semesterKey] || {};
        const code = saved[getCellKey(day, period)] || '';
        return getCourseByCode(code);
    }

    function getMergedCourses() {
        const merged = new Map();
        [...getSelectedCoursesForSemester('1q_1sem'), ...getSelectedCoursesForSemester('2q_2sem')].forEach(c => merged.set(c.code, c));
        return Array.from(merged.values());
    }

    function calculateProgress(selectedCourses) {
        const earned = {
            overall: 0, foundationRequired: 0, foundationHuman: 0, foundationSocial: 0,
            advancedRequired: 0, languageEnglish: 0, languageInitial: 0, academicRequired: 0,
            foundationTotal: 0, advancedTotal: 0, languageTotal: 0, academicTotal: 0
        };
        selectedCourses.forEach(course => {
            earned.overall += course.credits;
            if (course.category.startsWith('基盤科目')) earned.foundationTotal += course.credits;
            if (course.category.includes('人文科学')) earned.foundationHuman += course.credits;
            if (course.category.includes('社会科学')) earned.foundationSocial += course.credits;
            if (course.category.startsWith('先進科目')) earned.advancedTotal += course.credits;
            if (course.category.startsWith('言語科目')) earned.languageTotal += course.credits;
            if (course.category.startsWith('学術基礎科目')) earned.academicTotal += course.credits;
            course.requirementTags.forEach(tag => {
                if (Object.prototype.hasOwnProperty.call(earned, tag)) earned[tag] += course.credits;
            });
        });
        return earned;
    }

    function getRequirementColorClass(key) {
        if (key === 'foundationTotal' || key === 'foundationRequired' || key === 'foundationHuman' || key === 'foundationSocial') {
            return 'summary-cat-foundation';
        }
        if (key === 'advancedTotal' || key === 'advancedRequired') return 'summary-cat-advanced';
        if (key === 'languageTotal' || key === 'languageEnglish' || key === 'languageInitial') return 'summary-cat-language';
        if (key === 'academicTotal' || key === 'academicRequired') return 'summary-cat-academic';
        return '';
    }

    function updateSummary() {
        const sem1 = getSelectedCoursesForSemester('1q_1sem');
        const sem2 = getSelectedCoursesForSemester('2q_2sem');
        const merged = getMergedCourses();
        const earned = calculateProgress(merged);

        const sem1Credits = sem1.reduce((s, c) => s + c.credits, 0);
        const sem2Credits = sem2.reduce((s, c) => s + c.credits, 0);

        let html = '<h4>必要単位の進捗</h4>';
        html += `<p>1セメ合計: <strong>${sem1Credits}</strong> 単位 / 2セメ合計: <strong>${sem2Credits}</strong> 単位 / 1〜2セメ合計: <strong>${sem1Credits + sem2Credits}</strong> 単位</p>`;
        html += '<p><strong>主要要件（達成判定）</strong></p>';
        html += '<table><thead><tr><th>区分</th><th>取得</th><th>必要</th><th>残り</th></tr></thead><tbody>';
        primaryCreditRequirements.forEach(rule => {
            const got = earned[rule.key];
            const remain = Math.max(rule.required - got, 0);
            const cls = remain === 0 ? 'ok' : 'ng';
            const colorClass = getRequirementColorClass(rule.key);
            html += `<tr class="${colorClass}"><td>${rule.label}</td><td>${got}</td><td>${rule.required}</td><td class="${cls}">${remain}</td></tr>`;
        });
        html += '</tbody></table>';
        html += '<p class="credit-subnote"><strong>内訳（参考）</strong> ※ 下の値は上の合計に含まれます。</p>';
        html += '<table><thead><tr><th>内訳項目</th><th>取得</th><th>必要</th><th>残り</th></tr></thead><tbody>';
        detailCreditRequirements.forEach(rule => {
            const got = earned[rule.key];
            const remain = Math.max(rule.required - got, 0);
            const cls = remain === 0 ? 'ok' : 'ng';
            const colorClass = getRequirementColorClass(rule.key);
            html += `<tr class="${colorClass}"><td>${rule.label}</td><td>${got}</td><td>${rule.required}</td><td class="${cls}">${remain}</td></tr>`;
        });
        html += '</tbody></table>';
        creditSummary.innerHTML = html;

        if (merged.length === 0) {
            selectedCourseList.innerHTML = '<li>まだ科目が選択されていません。</li>';
            renderMobilePreview();
            return;
        }

        const semesterOrder = ['1q_1sem', '2q_2sem'];
        let listHtml = '';

        semesterOrder.forEach(semesterKey => {
            const coursesForSemester = getSelectedCoursesForSemester(semesterKey);
            if (coursesForSemester.length === 0) return;

            listHtml += `<li class="selected-group-header">${semesterLabels[semesterKey]}</li>`;

            dayKeys.forEach(day => {
                const dayItems = coursesForSemester
                    .filter(course => (course.slots || []).some(s => s.day === day))
                    .sort((a, b) => a.code.localeCompare(b.code));

                if (dayItems.length === 0) return;
                listHtml += `<li class="selected-day-header">${dayLabels[day]}曜日</li>`;

                dayItems.forEach(course => {
                    const slotText = (course.slots || [])
                        .filter(s => s.day === day)
                        .map(s => `${s.period}限`)
                        .join('・');
                    listHtml += `<li>${course.code} ${course.name} / ${course.credits}単位 / ${course.category} / ${dayLabels[day]}${slotText} / <a href="${getSyllabusUrl(course.code)}" target="_blank" rel="noopener noreferrer">シラバス</a></li>`;
                });
            });
        });

        selectedCourseList.innerHTML = listHtml;

        renderMobilePreview();
    }

    function renderMobilePreview() {
        if (!mobilePreviewGrid) return;

        let html = '<div class="mobile-preview-cell is-head"></div>';
        dayKeys.forEach(day => {
            html += `<div class="mobile-preview-cell is-head">${dayLabels[day]}</div>`;
        });

        for (let period = 1; period <= 5; period += 1) {
            html += `<div class="mobile-preview-cell is-period">${period}</div>`;
            dayKeys.forEach(day => {
                const lockedLabel = getLockedSlotLabel(currentPreviewSemester, day, period);
                if (lockedLabel) {
                    html += `<div class="mobile-preview-cell is-locked">${lockedLabel}</div>`;
                    return;
                }
                const course = getSelectedCourseAt(currentPreviewSemester, day, period);
                if (!course) {
                    html += '<div class="mobile-preview-cell">-</div>';
                    return;
                }
                html += `<div class="mobile-preview-cell ${getCategoryClass(course)}"><span class="mobile-preview-course-name">${course.name}</span><span class="mobile-preview-course-code">${course.code}</span></div>`;
            });
        }

        mobilePreviewGrid.innerHTML = html;
    }

    function getGridRowsForSemester(semesterKey) {
        const tbody = getGridBody(semesterKey);
        const rows = [];
        for (let period = 1; period <= 5; period += 1) {
            const row = { period };
            dayKeys.forEach(day => {
                const lockedLabel = getLockedSlotLabel(semesterKey, day, period);
                if (lockedLabel) {
                    row[day] = lockedLabel;
                    return;
                }
                const select = tbody.querySelector(`.timetable-select[data-day="${day}"][data-period="${period}"]`);
                const code = select?.value || '';
                const course = getCourseByCode(code);
                row[day] = course ? `${course.code} ${course.name}` : '-';
            });
            rows.push(row);
        }
        return rows;
    }

    function appendCompactGridTable(wrapper, title, semesterKey) {
        const section = document.createElement('section');
        section.style.margin = '8px 0 10px';

        const h2 = document.createElement('h2');
        h2.textContent = title;
        h2.style.margin = '0 0 6px';
        h2.style.fontSize = '16px';
        section.appendChild(h2);

        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = '42px repeat(5, minmax(0, 1fr))';
        grid.style.border = '1px solid #7b8b9a';
        grid.style.borderRadius = '8px';
        grid.style.overflow = 'hidden';

        const addCell = (text, opts = {}) => {
            const cell = document.createElement('div');
            cell.textContent = text;
            cell.style.borderRight = '1px solid #c4d0dc';
            cell.style.borderBottom = '1px solid #c4d0dc';
            cell.style.padding = opts.tight ? '3px 2px' : '4px 3px';
            cell.style.fontSize = opts.small ? '10px' : '11px';
            cell.style.lineHeight = '1.2';
            cell.style.whiteSpace = 'pre-line';
            cell.style.background = opts.bg || '#ffffff';
            cell.style.fontWeight = opts.bold ? '700' : '500';
            cell.style.textAlign = opts.align || 'left';
            if (opts.lastCol) cell.style.borderRight = 'none';
            grid.appendChild(cell);
        };

        addCell('', { bg: '#e9f0f7', bold: true, align: 'center' });
        dayKeys.forEach((day, index) => {
            addCell(dayLabels[day], { bg: '#e9f0f7', bold: true, align: 'center', lastCol: index === dayKeys.length - 1 });
        });

        for (let period = 1; period <= 5; period += 1) {
            addCell(String(period), { bg: '#f2f6fa', bold: true, align: 'center' });
            dayKeys.forEach((day, index) => {
                const lockedLabel = getLockedSlotLabel(semesterKey, day, period);
                if (lockedLabel) {
                    addCell(lockedLabel, { small: true, tight: true, bg: '#eef2f7', bold: true, align: 'center', lastCol: index === dayKeys.length - 1 });
                    return;
                }
                const course = getSelectedCourseAt(semesterKey, day, period);
                if (!course) {
                    addCell('-', { align: 'center', lastCol: index === dayKeys.length - 1 });
                    return;
                }
                addCell(`${course.name}\n(${course.code})`, { small: true, tight: true, bg: '#f8fbff', lastCol: index === dayKeys.length - 1 });
            });
        }

        section.appendChild(grid);
        wrapper.appendChild(section);
    }

    async function exportPdf() {
        if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
            alert('PDF出力ライブラリの読み込みに失敗しました。');
            return;
        }

        const merged = getMergedCourses();
        const earned = calculateProgress(merged);

        const wrapper = document.createElement('div');
        wrapper.style.width = '980px';
        wrapper.style.padding = '16px';
        wrapper.style.background = '#fff';
        wrapper.style.color = '#111';
        wrapper.style.fontFamily = '"Noto Sans JP", sans-serif';
        wrapper.style.position = 'fixed';
        wrapper.style.left = '-99999px';

        const title = document.createElement('h1');
        title.textContent = '東北大学医学部 My時間割（1セメ+2セメ）';
        title.style.margin = '0 0 6px';
        title.style.fontSize = '22px';
        wrapper.appendChild(title);

        const info = document.createElement('p');
        info.textContent = `作成日: ${new Date().toLocaleString('ja-JP')} / 全学教育科目合計: ${earned.overall} 単位`;
        info.style.margin = '0 0 8px';
        info.style.fontSize = '12px';
        wrapper.appendChild(info);

        appendCompactGridTable(wrapper, semesterLabels['1q_1sem'], '1q_1sem');
        appendCompactGridTable(wrapper, semesterLabels['2q_2sem'], '2q_2sem');

        document.body.appendChild(wrapper);

        try {
            const canvas = await window.html2canvas(wrapper, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const maxWidth = pageWidth - 20;
            const maxHeight = pageHeight - 20;
            const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
            const imgWidth = canvas.width * ratio;
            const imgHeight = canvas.height * ratio;
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;
            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

            const dateStamp = new Date().toISOString().slice(0, 10);
            pdf.save(`tohoku-med-timetable-${dateStamp}.pdf`);
        } catch (e) {
            alert('PDF出力中にエラーが発生しました。');
            console.error(e);
        } finally {
            wrapper.remove();
        }
    }

    function resetAll() {
        semesterSelections['1q_1sem'] = {};
        semesterSelections['2q_2sem'] = {};
        persistSelections();
        renderSemesterGrid('1q_1sem');
        renderSemesterGrid('2q_2sem');
        updateSummary();
    }

    function bindPreviewEvents() {
        if (toggleMobilePreviewBtn && mobilePreviewBody) {
            toggleMobilePreviewBtn.addEventListener('click', () => {
                const hidden = mobilePreviewBody.hasAttribute('hidden');
                if (hidden) {
                    mobilePreviewBody.removeAttribute('hidden');
                    toggleMobilePreviewBtn.textContent = 'プレビューを閉じる';
                    renderMobilePreview();
                } else {
                    mobilePreviewBody.setAttribute('hidden', '');
                    toggleMobilePreviewBtn.textContent = 'プレビューを表示';
                }
            });
        }

        previewSemesterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const semester = btn.dataset.previewSemester;
                if (!semester) return;
                currentPreviewSemester = semester;
                previewSemesterButtons.forEach(el => el.classList.toggle('is-active', el === btn));
                renderMobilePreview();
            });
        });
    }

    note.textContent = '1セメ・2セメを同時に選択し、合算単位で進捗管理できます（2026年度版）。初修語I/IIは連動します。';

    loadSelections();
    renderSemesterGrid('1q_1sem');
    renderSemesterGrid('2q_2sem');
    bindPreviewEvents();
    updateSummary();

    resetBtn.addEventListener('click', resetAll);
    downloadBtn.addEventListener('click', exportPdf);
});
