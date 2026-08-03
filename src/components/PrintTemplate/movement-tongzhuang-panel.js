// ========== 通装器材调拨通知单 - 打印面板构建器 ==========
// A4 横向 (297×210mm)，动态分页，签字仅末页
// 布局：左标题右网格（参照入库单 40%:60% 比例）

// ========== 工具函数 ==========
const createStaticText = (left, top, width, height, text, extra = {}) => ({
  options: { left, top, width, height, title: text, coordinateSync: false, widthHeightSync: false, ...extra },
  printElementType: { title: "文本", type: "text" }
});
const createValueText = (left, top, width, height, field, extra = {}) => ({
  options: { left, top, width, height, title: "", field, fields: [{ text: "", field }], coordinateSync: false, widthHeightSync: false, ...extra },
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

// ========== 布局常量 ==========
const LEFT_X = 28, LEFT_W = 270;
const GRID_X = 308, GRID_W = 492;
const HEADER_TOP = 22, HEADER_H = 120;
const ROW_H = 24;
const ROWS = 5;

// 网格内部列分割（4列）
const COL1_LABEL_X = GRID_X;
const COL1_VALUE_X = GRID_X + 72;
const COL2_LABEL_X = GRID_X + 72 + 90;
const COL2_VALUE_X = GRID_X + 72 + 90 + 80;

// ========== 单据头元素（每页重复） ==========
const HEADER_ELEMENTS = [
  // ---- 左侧：标题 + 年月日 + 单号 ----
  createStaticText(LEFT_X, HEADER_TOP, LEFT_W, 40, "通装器材调拨通知单", {
    fontSize: 16, fontWeight: "700", textAlign: "center", lineHeight: 40, textDecoration: "underline"
  }),
  // 年月日填空 + 单号：上下对齐，宽度一致
  createHLine(82, HEADER_TOP + 58, 20),
  createStaticText(102, HEADER_TOP + 45, 14, 16, "年", { fontSize: 10, lineHeight: 16 }),
  createHLine(116, HEADER_TOP + 58, 20),
  createStaticText(136, HEADER_TOP + 45, 14, 16, "月", { fontSize: 10, lineHeight: 16 }),
  createHLine(150, HEADER_TOP + 58, 20),
  createStaticText(170, HEADER_TOP + 45, 14, 16, "日", { fontSize: 10, lineHeight: 16 }),
  // 单号（与年月日同宽居中）
  createStaticText(78, HEADER_TOP + 70, 140, 30, "通字第（____________）号", {
    fontSize: 10, textAlign: "center", lineHeight: 30
  }),

  // ---- 右侧：网格外框 + 内部分隔线 ----
  createRect(GRID_X, HEADER_TOP, GRID_W, HEADER_H),
  // 竖线：COL1_VALUE_X 全高（发物单位行也保留分隔），COL2_LABEL_X/COL2_VALUE_X 跳过 row1
  createVLine(COL1_VALUE_X, HEADER_TOP, HEADER_H),
  createVLine(COL2_LABEL_X, HEADER_TOP, ROW_H),
  createVLine(COL2_LABEL_X, HEADER_TOP + ROW_H * 2, ROW_H * 3),
  createVLine(COL2_VALUE_X, HEADER_TOP, ROW_H),
  createVLine(COL2_VALUE_X, HEADER_TOP + ROW_H * 2, ROW_H * 3),
  createHLine(GRID_X, HEADER_TOP + ROW_H, GRID_W),
  createHLine(GRID_X, HEADER_TOP + ROW_H * 2, GRID_W),
  createHLine(GRID_X, HEADER_TOP + ROW_H * 3, GRID_W),
  createHLine(GRID_X, HEADER_TOP + ROW_H * 4, GRID_W),

  // ---- 网格内容（5行 × 4列） ----
  // Row 1: 调拨根据 / 调拨目的
  createStaticText(COL1_LABEL_X + 4, HEADER_TOP + 5, 66, 14, "调拨根据", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL1_VALUE_X + 2, HEADER_TOP + 5, 86, 14, "dispatchBasis", { fontSize: 10, textAlign: "center", lineHeight: 14 }),
  createStaticText(COL2_LABEL_X + 4, HEADER_TOP + 5, 76, 14, "调拨目的", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL2_VALUE_X + 2, HEADER_TOP + 5, 246, 14, "dispatchPurpose", { fontSize: 10, textAlign: "center", lineHeight: 14 }),

  // Row 2: 发物单位（独占一整行，合并中间两列）
  createStaticText(COL1_LABEL_X + 4, HEADER_TOP + ROW_H + 5, 66, 14, "发物单位", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL1_VALUE_X + 2, HEADER_TOP + ROW_H + 5, GRID_X + GRID_W - COL1_VALUE_X - 2, 14, "fromUnit", { fontSize: 10, textAlign: "center", lineHeight: 14 }),

  // Row 3: 收物单位 / 到站
  createStaticText(COL1_LABEL_X + 4, HEADER_TOP + ROW_H * 2 + 5, 66, 14, "收物单位", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL1_VALUE_X + 2, HEADER_TOP + ROW_H * 2 + 5, 86, 14, "toUnit", { fontSize: 10, textAlign: "center", lineHeight: 14 }),
  createStaticText(COL2_LABEL_X + 4, HEADER_TOP + ROW_H * 2 + 5, 76, 14, "到站", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL2_VALUE_X + 2, HEADER_TOP + ROW_H * 2 + 5, 246, 14, "toStation", { fontSize: 10, textAlign: "center", lineHeight: 14 }),

  // Row 4: 通信地址 / 调拨方式
  createStaticText(COL1_LABEL_X + 4, HEADER_TOP + ROW_H * 3 + 5, 66, 14, "通信地址", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL1_VALUE_X + 2, HEADER_TOP + ROW_H * 3 + 5, 86, 14, "contactAddress", { fontSize: 10, textAlign: "center", lineHeight: 14 }),
  createStaticText(COL2_LABEL_X + 4, HEADER_TOP + ROW_H * 3 + 5, 76, 14, "调拨方式", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL2_VALUE_X + 2, HEADER_TOP + ROW_H * 3 + 5, 246, 14, "dispatchMode", { fontSize: 10, textAlign: "center", lineHeight: 14 }),

  // Row 5: 有效日期 / 发出日期
  createStaticText(COL1_LABEL_X + 4, HEADER_TOP + ROW_H * 4 + 5, 66, 14, "有效日期", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL1_VALUE_X + 2, HEADER_TOP + ROW_H * 4 + 5, 86, 14, "effectiveDate", { fontSize: 10, textAlign: "center", lineHeight: 14 }),
  createStaticText(COL2_LABEL_X + 4, HEADER_TOP + ROW_H * 4 + 5, 76, 14, "发出日期", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL2_VALUE_X + 2, HEADER_TOP + ROW_H * 4 + 5, 246, 14, "issueDate", { fontSize: 10, textAlign: "center", lineHeight: 14 }),
];

// ========== 表格列定义 ==========
const detailColumns = [
  [
    { title: "序号", field: "serialNo", width: 40, checked: true, columnId: "serialNo", rowspan: 2, colspan: 1, align: "center" },
    { title: "名称", field: "itemName", width: 82, checked: true, columnId: "itemName", rowspan: 2, colspan: 1, align: "center" },
    { title: "规格型号", field: "skuName", width: 82, checked: true, columnId: "skuName", rowspan: 2, colspan: 1, align: "center" },
    { title: "计量单位", field: "unitName", width: 52, checked: true, columnId: "unitName", rowspan: 2, colspan: 1, align: "center" },
    { title: "应发", checked: true, rowspan: 1, colspan: 2, align: "center" },
    { title: "实发", checked: true, rowspan: 1, colspan: 2, align: "center" },
    { title: "实收", checked: true, rowspan: 1, colspan: 2, align: "center" },
    { title: "金额", checked: true, rowspan: 1, colspan: 2, align: "center" },
    { title: "备注", field: "remark", width: 58, checked: true, columnId: "remark", rowspan: 2, colspan: 1, align: "center" },
  ],
  [
    { title: "等级", field: "dispatchLevel", width: 50, checked: true, columnId: "dispatchLevel", rowspan: 1, colspan: 1, align: "center" },
    { title: "数量", field: "dispatchQuantity", width: 50, checked: true, columnId: "dispatchQuantity", rowspan: 1, colspan: 1, align: "center" },
    { title: "数量", field: "actualDispatchQty", width: 50, checked: true, columnId: "actualDispatchQty", rowspan: 1, colspan: 1, align: "center" },
    { title: "等级", field: "actualDispatchLevel", width: 50, checked: true, columnId: "actualDispatchLevel", rowspan: 1, colspan: 1, align: "center" },
    { title: "数量", field: "actualReceiptQty", width: 50, checked: true, columnId: "actualReceiptQty", rowspan: 1, colspan: 1, align: "center" },
    { title: "等级", field: "actualReceiptLevel", width: 50, checked: true, columnId: "actualReceiptLevel", rowspan: 1, colspan: 1, align: "center" },
    { title: "单价", field: "unitPrice", width: 50, checked: true, columnId: "unitPrice", rowspan: 1, colspan: 1, align: "center" },
    { title: "总价", field: "lineAmount", width: 56, checked: true, columnId: "lineAmount", rowspan: 1, colspan: 1, align: "center" },
  ]
];

// ========== 表格/分页常量 ==========
const ROWS_PER_PAGE = 8;
const TABLE_TOP = 152;
const TABLE_BOTTOM_LIMIT = 490;
const TABLE_HEADER_HEIGHT = 32;
const ROW_HEIGHT = (TABLE_BOTTOM_LIMIT - TABLE_TOP - TABLE_HEADER_HEIGHT) / ROWS_PER_PAGE;

const TABLE_ELEMENT_OPTIONS = {
  editable: true, columnDisplayEditable: true, columnDisplayIndexEditable: true,
  columnTitleEditable: true, columnResizable: true, columnAlignEditable: true,
  isEnableEditField: true, isEnableContextMenu: true, isEnableInsertRow: true,
  isEnableDeleteRow: true, isEnableInsertColumn: true, isEnableDeleteColumn: true, isEnableMergeCell: true
};

export function buildTongZhuangPanels(allRows) {
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

    const tableHeight = TABLE_HEADER_HEIGHT + pageData.length * ROW_HEIGHT;

    // 签字区域（仅末页，三列对齐，间距35pt，列宽250，缩小列间距确保右侧留白）
    const sigTop = TABLE_TOP + tableHeight + 35;
    const SIG_COL_W = 230;
    const SIG_GAP = 46;
    const COL1 = 30, COL2 = 30 + SIG_COL_W + SIG_GAP, COL3 = 30 + (SIG_COL_W + SIG_GAP) * 2;
    const signatureElements = isLastPage ? [
      // ---- 第1行：盖章标题 ----
      createStaticText(COL1, sigTop, SIG_COL_W, 18, "编制单位（盖章）：", { fontSize: 10, fontWeight: "600", lineHeight: 18 }),
      createStaticText(COL2, sigTop, SIG_COL_W, 18, "发物单位（盖章）：", { fontSize: 10, fontWeight: "600", lineHeight: 18 }),
      createStaticText(COL3, sigTop, SIG_COL_W, 18, "收物单位（盖章）：", { fontSize: 10, fontWeight: "600", lineHeight: 18 }),
      // ---- 第2行：___长（签名） ----
      createHLine(COL1, sigTop + 38, 28),
      createStaticText(COL1 + 28, sigTop + 22, 80, 20, "长（签名）：", { fontSize: 10, lineHeight: 20 }),
      createHLine(COL1 + 108, sigTop + 38, 110),
      createHLine(COL2, sigTop + 38, 28),
      createStaticText(COL2 + 28, sigTop + 22, 80, 20, "长（签名）：", { fontSize: 10, lineHeight: 20 }),
      createHLine(COL2 + 108, sigTop + 38, 110),
      createHLine(COL3, sigTop + 38, 28),
      createStaticText(COL3 + 28, sigTop + 22, 80, 20, "长（签名）：", { fontSize: 10, lineHeight: 20 }),
      createHLine(COL3 + 108, sigTop + 38, 110),
      // ---- 第3行：承办人/经手人 ----
      createStaticText(COL1, sigTop + 44, SIG_COL_W, 20, "承办人（签名）：", { fontSize: 10, lineHeight: 20 }),
      createHLine(COL1 + 90, sigTop + 60, 125),
      createStaticText(COL2, sigTop + 44, SIG_COL_W, 20, "发货经手人（签名）：", { fontSize: 10, lineHeight: 20 }),
      createHLine(COL2 + 105, sigTop + 60, 110),
      createStaticText(COL3, sigTop + 44, SIG_COL_W, 20, "收货经手人（签名）：", { fontSize: 10, lineHeight: 20 }),
      createHLine(COL3 + 105, sigTop + 60, 110),
      // ---- 第4行：留存选项（4个一行） ----
      createStaticText(30, sigTop + 68, 200, 12, "□机关留存", { fontSize: 9, lineHeight: 12 }),
      createStaticText(240, sigTop + 68, 200, 12, "□返回机关留存", { fontSize: 9, lineHeight: 12 }),
      createStaticText(460, sigTop + 68, 200, 12, "□发货单位留存", { fontSize: 9, lineHeight: 12 }),
      createStaticText(680, sigTop + 68, 200, 12, "□收货单位留存", { fontSize: 9, lineHeight: 12 }),
    ] : [];

    const pageNoElement = createValueText(0, 560, 800, 14, `pageNo${page}`, {
      fontSize: 10, textAlign: "center", lineHeight: 14, color: "#666"
    });

    const elements = [
      ...HEADER_ELEMENTS,
      {
        options: {
          left: LEFT_X, top: TABLE_TOP, height: tableHeight, width: GRID_X + GRID_W - LEFT_X,
          field: fieldName, columns: detailColumns,
          tableBodyRowHeight: ROW_HEIGHT, tableHeaderBackground: "#f0f0f0"
        },
        printElementType: { title: "表格", type: "table", ...TABLE_ELEMENT_OPTIONS }
      },
      ...signatureElements,
      pageNoElement
    ];

    panels.push({
      index: page, name: page + 1, height: 210, width: 297,
      paperHeader: HEADER_TOP + HEADER_H + 8, paperFooter: 595,
      printElements: elements,
      paperNumberDisabled: true, paperNumberContinue: false, watermarkOptions: {}
    });
  }
  return { panels, pageDataMap };
}

export default { buildTongZhuangPanels, ROWS_PER_PAGE };
