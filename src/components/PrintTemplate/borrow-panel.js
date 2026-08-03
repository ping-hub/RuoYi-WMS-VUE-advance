// ========== 工具函数 ==========
const createStaticText = (left, top, width, height, text, extra = {}) => ({
  options: {
    left, top, width, height,
    title: text,
    coordinateSync: false,
    widthHeightSync: false,
    ...extra
  },
  printElementType: { title: "文本", type: "text" }
});

const createValueText = (left, top, width, height, field, extra = {}) => ({
  options: {
    left, top, width, height,
    title: "", field,
    fields: [{ text: "", field }],
    coordinateSync: false,
    widthHeightSync: false,
    ...extra
  },
  printElementType: { title: "文本", type: "text" }
});

const createHLine = (left, top, width, extra = {}) => ({
  options: { left, top, width, ...extra },
  printElementType: { title: "横线", type: "hline" }
});

// ========== 表格列定义（单行表头，7列） ==========
const detailColumns = [
  [
    { title: "序号", field: "serialNo", width: 42, checked: true, columnId: "serialNo", rowspan: 1, colspan: 1, align: "center" },
    { title: "器材编码", field: "itemCode", width: 90, checked: true, columnId: "itemCode", rowspan: 1, colspan: 1, align: "center" },
    { title: "器材名称", field: "itemName", width: 90, checked: true, columnId: "itemName", rowspan: 1, colspan: 1, align: "center" },
    { title: "规格型号", field: "skuName", width: 90, checked: true, columnId: "skuName", rowspan: 1, colspan: 1, align: "center" },
    { title: "数量", field: "quantity", width: 48, checked: true, columnId: "quantity", rowspan: 1, colspan: 1, align: "center" },
    { title: "借用日期", field: "borrowDate", width: 80, checked: true, columnId: "borrowDate", rowspan: 1, colspan: 1, align: "center" },
    { title: "归还日期", field: "returnDate", width: 80, checked: true, columnId: "returnDate", rowspan: 1, colspan: 1, align: "center" },
  ]
];

// ========== 布局常量（A4横向坐标系） ==========
const ROWS_PER_PAGE = 10;
const TABLE_TOP = 62;           // 表格起始 Y（标题占用较少空间，比入库单靠前）
const TABLE_BOTTOM_LIMIT = 430; // 表格数据行截止位置（为签字区+页码预留空间）
const TABLE_HEADER_HEIGHT = 24; // 单行表头高度
const ROW_HEIGHT = (TABLE_BOTTOM_LIMIT - TABLE_TOP - TABLE_HEADER_HEIGHT) / ROWS_PER_PAGE; // 统一行高 ≈ 34.4pt

/**
 * 构建借用单打印多页面板
 * 标题 + 7列表格 + 2×5签字区（全手写）
 * @param {Array} allRows - 全部明细行数据
 * @returns {Object} { panels, pageDataMap } panels数组 + 分页数据映射
 */
export function buildBorrowPanels(allRows) {
  const totalRows = allRows.length || 1;
  const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
  const panels = [];
  const pageDataMap = {};

  for (let page = 0; page < totalPages; page++) {
    const start = page * ROWS_PER_PAGE;
    const end = Math.min(start + ROWS_PER_PAGE, totalRows);
    const pageData = allRows.slice(start, end);
    const isLastPage = page === totalPages - 1;
    const fieldName = `tablePage${page}`;

    pageDataMap[fieldName] = pageData;

    // 统一行高计算表格高度
    const tableHeight = TABLE_HEADER_HEIGHT + pageData.length * ROW_HEIGHT;
    const bodyRowHeight = ROW_HEIGHT;

    // 签字区域：距表格底部 35pt，2×5 双列布局（全部静态，不赋值）
    // 文字与冒号分离，每个字符用 span 包裹，通过 flexbox space-between 实现两端对齐（兼容 Safari）
    // styleHandler 中通过 CSS attribute selector [style*="width: 55pt"] 精确定位签字标签
    const w = (t) => t.split('').map(c => `<span>${c}</span>`).join('');
    const sigTop = TABLE_TOP + tableHeight + 35;
    const signatureElements = isLastPage ? [
      // —— 左列：发物方 ——
      createStaticText(30, sigTop, 55, 18, w("发物单位"), { fontSize: 11, fontWeight: "600" }),
      createStaticText(90, sigTop, 10, 18, "：", { fontSize: 11, fontWeight: "600" }),
      createHLine(98, sigTop + 14, 136),
      createStaticText(30, sigTop + 24, 55, 18, w("发物人"), { fontSize: 11, fontWeight: "600" }),
      createStaticText(90, sigTop + 24, 10, 18, "：", { fontSize: 11, fontWeight: "600" }),
      createHLine(98, sigTop + 38, 136),
      createStaticText(30, sigTop + 48, 55, 18, w("审批人"), { fontSize: 11, fontWeight: "600" }),
      createStaticText(90, sigTop + 48, 10, 18, "：", { fontSize: 11, fontWeight: "600" }),
      createHLine(98, sigTop + 62, 136),
      createStaticText(30, sigTop + 72, 55, 18, w("联系电话"), { fontSize: 11, fontWeight: "600" }),
      createStaticText(90, sigTop + 72, 10, 18, "：", { fontSize: 11, fontWeight: "600" }),
      createHLine(98, sigTop + 86, 136),
      createStaticText(30, sigTop + 96, 55, 18, w("日期"), { fontSize: 11, fontWeight: "600" }),
      createStaticText(90, sigTop + 96, 10, 18, "：", { fontSize: 11, fontWeight: "600" }),
      createHLine(98, sigTop + 110, 136),
      // —— 右列：借用方 ——
      createStaticText(430, sigTop, 55, 18, w("借用单位"), { fontSize: 11, fontWeight: "600" }),
      createStaticText(490, sigTop, 10, 18, "：", { fontSize: 11, fontWeight: "600" }),
      createHLine(498, sigTop + 14, 136),
      createStaticText(430, sigTop + 24, 55, 18, w("借用人"), { fontSize: 11, fontWeight: "600" }),
      createStaticText(490, sigTop + 24, 10, 18, "：", { fontSize: 11, fontWeight: "600" }),
      createHLine(498, sigTop + 38, 136),
      createStaticText(430, sigTop + 48, 55, 18, w("申请人"), { fontSize: 11, fontWeight: "600" }),
      createStaticText(490, sigTop + 48, 10, 18, "：", { fontSize: 11, fontWeight: "600" }),
      createHLine(498, sigTop + 62, 136),
      createStaticText(430, sigTop + 72, 55, 18, w("联系电话"), { fontSize: 11, fontWeight: "600" }),
      createStaticText(490, sigTop + 72, 10, 18, "：", { fontSize: 11, fontWeight: "600" }),
      createHLine(498, sigTop + 86, 136),
      createStaticText(430, sigTop + 96, 55, 18, w("日期"), { fontSize: 11, fontWeight: "600" }),
      createStaticText(490, sigTop + 96, 10, 18, "：", { fontSize: 11, fontWeight: "600" }),
      createHLine(498, sigTop + 110, 136),
    ] : [];

    // 页码元素
    const pageNoElement = createValueText(0, 540, 800, 14, `pageNo${page}`, {
      fontSize: 10,
      textAlign: "center",
      lineHeight: 14,
      color: "#666"
    });

    // 组装元素：标题 + 表格 + 签字 + 页码
    const elements = [
      // 标题（每页重复）
      createStaticText(28, 10, 744, 44, "器材借用单", {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
        lineHeight: 44,
        textDecoration: "underline"
      }),
      // 数据表格
      {
        options: {
          left: 28,
          top: TABLE_TOP,
          height: tableHeight,
          width: 744,
          field: fieldName,
          columns: detailColumns,
          tableBodyRowHeight: bodyRowHeight,
          tableHeaderBackground: "#f0f0f0"
        },
        printElementType: {
          title: "表格",
          type: "table",
          editable: true,
          columnDisplayEditable: true,
          columnDisplayIndexEditable: true,
          columnTitleEditable: true,
          columnResizable: true,
          columnAlignEditable: true,
          isEnableEditField: true,
          isEnableContextMenu: true,
          isEnableInsertRow: true,
          isEnableDeleteRow: true,
          isEnableInsertColumn: true,
          isEnableDeleteColumn: true,
          isEnableMergeCell: true
        }
      },
      ...signatureElements,
      pageNoElement
    ];

    panels.push({
      index: page,
      name: page + 1,
      height: 210,   // A4 横向
      width: 297,
      paperHeader: 54,
      paperFooter: 595,
      printElements: elements,
      paperNumberDisabled: true,
      paperNumberContinue: false,
      watermarkOptions: {}
    });
  }

  return { panels, pageDataMap };
}

export default { buildBorrowPanels, ROWS_PER_PAGE };
