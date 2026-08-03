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

const createRect = (left, top, width, height, extra = {}) => ({
  options: { left, top, width, height, ...extra },
  printElementType: { title: "矩形", type: "rect" }
});

const createHLine = (left, top, width, extra = {}) => ({
  options: { left, top, width, ...extra },
  printElementType: { title: "横线", type: "hline" }
});

const createVLine = (left, top, height, extra = {}) => ({
  options: { left, top, height, ...extra },
  printElementType: { title: "竖线", type: "vline" }
});

// ========== 表格列定义（两行合并表头） ==========
const detailColumns = [
  [
    { title: "序号", field: "serialNo", width: 42, checked: true, columnId: "serialNo", rowspan: 2, colspan: 1, align: "center" },
    { title: "名称", field: "itemName", width: 78, checked: true, columnId: "itemName", rowspan: 2, colspan: 1, align: "center" },
    { title: "规格型号", field: "skuName", width: 78, checked: true, columnId: "skuName", rowspan: 2, colspan: 1, align: "center" },
    { title: "计量单位", field: "unitName", width: 52, checked: true, columnId: "unitName", rowspan: 2, colspan: 1, align: "center" },
    { title: "调拨数量", checked: true, rowspan: 1, colspan: 2, align: "center" },
    { title: "出库数量", checked: true, rowspan: 1, colspan: 2, align: "center" },
    { title: "单价（元）", field: "unitPrice", width: 56, checked: true, columnId: "unitPrice", rowspan: 2, colspan: 1, align: "center" },
    { title: "总价（元）", field: "lineAmount", width: 62, checked: true, columnId: "lineAmount", rowspan: 2, colspan: 1, align: "center" },
    { title: "备注", field: "remark", width: 62, checked: true, columnId: "remark", rowspan: 2, colspan: 1, align: "center" },
  ],
  [
    { title: "等级", field: "dispatchLevel", width: 54, checked: true, columnId: "dispatchLevel", rowspan: 1, colspan: 1, align: "center" },
    { title: "数量", field: "dispatchQuantity", width: 48, checked: true, columnId: "dispatchQuantity", rowspan: 1, colspan: 1, align: "center" },
    { title: "等级", field: "shipmentLevel", width: 54, checked: true, columnId: "shipmentLevel", rowspan: 1, colspan: 1, align: "center" },
    { title: "数量", field: "shipmentQuantity", width: 48, checked: true, columnId: "shipmentQuantity", rowspan: 1, colspan: 1, align: "center" },
  ]
];

// ========== 单据头元素定义（A4横向坐标系） ==========
// 页高 595pt (210mm)，单据头区域 top 22~104，表格从 118 开始
const HEADER_ELEMENTS = [
  // —— 出库通知单（带下划线、无框线、大字号，左侧40%） ——
  createStaticText(28, 22, 290, 82, "出库通知单", {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 82,
    textDecoration: "underline"
  }),

  // —— 右侧格子区域外框（60%，右边界对齐表格右边界 800pt） ——
  createRect(330, 22, 470, 82),
  createVLine(422, 22, 82),
  createVLine(544, 22, 82),
  createVLine(634, 22, 82),
  createHLine(330, 50, 470),
  createHLine(330, 77, 470),

  // —— 格子内容（3行×2对 label/value，label窄value宽） ——
  // Row 1: 调拨根据 / 调拨方式
  createStaticText(334, 32, 72, 14, "调拨根据", { fontSize: 11.5, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(426, 32, 98, 14, "basisNo", { fontSize: 11.5, textAlign: "center", lineHeight: 14 }),
  createStaticText(548, 32, 72, 14, "调拨方式", { fontSize: 11.5, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(638, 32, 128, 14, "dispatchMode", { fontSize: 11.5, textAlign: "center", lineHeight: 14 }),

  // Row 2: 通知机关 / 收物单位
  createStaticText(334, 59, 72, 14, "通知机关", { fontSize: 11.5, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(426, 59, 98, 14, "noticeOrg", { fontSize: 11.5, textAlign: "center", lineHeight: 14 }),
  createStaticText(548, 59, 72, 14, "收物单位", { fontSize: 11.5, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(638, 59, 128, 14, "receiveUnit", { fontSize: 11.5, textAlign: "center", lineHeight: 14 }),

  // Row 3: 采购日期 / 出库日期
  createStaticText(334, 86, 72, 14, "采购日期", { fontSize: 11.5, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(426, 86, 98, 14, "purchaseDate", { fontSize: 10.5, textAlign: "center", lineHeight: 14 }),
  createStaticText(548, 86, 72, 14, "出库日期", { fontSize: 11.5, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(638, 86, 128, 14, "shipmentDate", { fontSize: 10.5, textAlign: "center", lineHeight: 14 }),
];

const ROWS_PER_PAGE = 10;
const TABLE_TOP = 118;          // 表格起始 Y
const TABLE_BOTTOM_LIMIT = 480; // 表格数据行截止位置（为签字+页码预留空间）
const TABLE_HEADER_HEIGHT = 32; // 双行表头高度
const ROW_HEIGHT = (TABLE_BOTTOM_LIMIT - TABLE_TOP - TABLE_HEADER_HEIGHT) / ROWS_PER_PAGE; // 统一行高

/**
 * 构建出库单打印多页面板
 * 每页使用独立的字段名(tablePage0/tablePage1...)避免hiprint重复渲染全部数据
 * 所有页使用统一行高，表格不超过截止位置，签字区域紧跟表格底部
 * @param {Array} allRows - 全部明细行数据
 * @returns {Object} { panels, pageDataMap } panels数组 + 分页数据映射
 */
export function buildShipmentPanels(allRows) {
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

    // 存储当前页的数据到独立字段
    pageDataMap[fieldName] = pageData;

    // 统一行高计算表格高度：表头 + 实际行数 × 行高
    const tableHeight = TABLE_HEADER_HEIGHT + pageData.length * ROW_HEIGHT;
    const bodyRowHeight = ROW_HEIGHT;

    // 签字区域紧跟表格之后（含下划线，等宽等距对齐表格边界，4栏）
    const sigTop = TABLE_TOP + tableHeight + 35;
    const signatureElements = isLastPage ? [
      createStaticText(30, sigTop, 100, 20, "采购（配发）人：", { fontSize: 12, fontWeight: "600" }),
      createHLine(134, sigTop + 16, 134),
      createStaticText(274, sigTop, 55, 20, "验收人：", { fontSize: 12, fontWeight: "600" }),
      createHLine(333, sigTop + 16, 134),
      createStaticText(473, sigTop, 55, 20, "保管员：", { fontSize: 12, fontWeight: "600" }),
      createHLine(532, sigTop + 16, 134),
      createStaticText(672, sigTop, 55, 20, "审批人：", { fontSize: 12, fontWeight: "600" }),
      createHLine(731, sigTop + 16, 69),
    ] : [];

    // 页码元素（由 handlePrint 替换为格式化文本）
    const pageNoElement = createValueText(0, 540, 800, 14, `pageNo${page}`, {
      fontSize: 10,
      textAlign: "center",
      lineHeight: 14,
      color: "#666"
    });

    // 组装当前页的元素：单据头 + 表格 + 签字 + 页码
    const elements = [
      ...HEADER_ELEMENTS,
      {
        options: {
          left: 28,
          top: TABLE_TOP,
          height: tableHeight,
          width: 772,
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
      paperHeader: 108,
      paperFooter: 595,
      printElements: elements,
      paperNumberDisabled: true,
      paperNumberContinue: false,
      watermarkOptions: {}
    });
  }

  return { panels, pageDataMap };
}

// 保留默认导出以兼容现有 import
export default { buildShipmentPanels, ROWS_PER_PAGE };
