// ========== 专装器材调拨单 - 打印面板构建器 ==========
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
// 左侧标题区 ~35%，右侧网格区 ~65%
const LEFT_X = 28, LEFT_W = 270;       // 左区 x=28, w=270
const GRID_X = 308, GRID_W = 492;       // 右区 x=308, w=492 → 右边界=800
const HEADER_TOP = 22, HEADER_H = 120;  // 头部区域 y=22~142
const ROW_H = 24;                       // 网格每行高度
const ROWS = 5;                         // 5行元数据

// 网格内部列分割（4列：label | value | label | value）
const COL1_LABEL_X = GRID_X;            // 308
const COL1_VALUE_X = GRID_X + 72;       // 380
const COL2_LABEL_X = GRID_X + 72 + 90;  // 470
const COL2_VALUE_X = GRID_X + 72 + 90 + 80; // 550
const COL_WIDTHS = [72, 90, 80, GRID_W - 72 - 90 - 80]; // 72+90+80+250=492

// ========== 单据头元素（每页重复） ==========
const HEADER_ELEMENTS = [
  // ---- 左侧：标题 + 单号（约35%宽度） ----
  createStaticText(LEFT_X, HEADER_TOP, LEFT_W, 70, "专装器材调拨单", {
    fontSize: 18, fontWeight: "700", textAlign: "center", lineHeight: 70, textDecoration: "underline"
  }),
  createStaticText(LEFT_X, HEADER_TOP + 75, LEFT_W, 30, "专字第________号", {
    fontSize: 10, textAlign: "center", lineHeight: 30
  }),

  // ---- 右侧：网格外框 + 内部分隔线（约65%宽度） ----
  createRect(GRID_X, HEADER_TOP, GRID_W, HEADER_H),
  // 竖线（3条内部分隔，分成4列）
  createVLine(COL1_VALUE_X, HEADER_TOP, HEADER_H),
  createVLine(COL2_LABEL_X, HEADER_TOP, HEADER_H),
  createVLine(COL2_VALUE_X, HEADER_TOP, HEADER_H),
  // 横线（5条内部分隔，分成5+1行，第一行顶部已由矩形覆盖）
  createHLine(GRID_X, HEADER_TOP + ROW_H, GRID_W),
  createHLine(GRID_X, HEADER_TOP + ROW_H * 2, GRID_W),
  createHLine(GRID_X, HEADER_TOP + ROW_H * 3, GRID_W),
  createHLine(GRID_X, HEADER_TOP + ROW_H * 4, GRID_W),

  // ---- 网格内容（5行 × 2对 label/value） ----
  // Row 1: 调拨依据 / 调拨方式
  createStaticText(COL1_LABEL_X + 4, HEADER_TOP + 5, 66, 14, "调拨依据", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL1_VALUE_X + 2, HEADER_TOP + 5, 86, 14, "dispatchBasis", { fontSize: 10, textAlign: "center", lineHeight: 14 }),
  createStaticText(COL2_LABEL_X + 4, HEADER_TOP + 5, 76, 14, "调拨方式", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL2_VALUE_X + 2, HEADER_TOP + 5, 246, 14, "dispatchMode", { fontSize: 10, textAlign: "center", lineHeight: 14 }),

  // Row 2: 发货单位 / 收货单位
  createStaticText(COL1_LABEL_X + 4, HEADER_TOP + ROW_H + 5, 66, 14, "发货单位", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL1_VALUE_X + 2, HEADER_TOP + ROW_H + 5, 86, 14, "fromUnit", { fontSize: 10, textAlign: "center", lineHeight: 14 }),
  createStaticText(COL2_LABEL_X + 4, HEADER_TOP + ROW_H + 5, 76, 14, "收货单位", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL2_VALUE_X + 2, HEADER_TOP + ROW_H + 5, 246, 14, "toUnit", { fontSize: 10, textAlign: "center", lineHeight: 14 }),

  // Row 3: 发站 / 到站
  createStaticText(COL1_LABEL_X + 4, HEADER_TOP + ROW_H * 2 + 5, 66, 14, "发站", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL1_VALUE_X + 2, HEADER_TOP + ROW_H * 2 + 5, 86, 14, "fromStation", { fontSize: 10, textAlign: "center", lineHeight: 14 }),
  createStaticText(COL2_LABEL_X + 4, HEADER_TOP + ROW_H * 2 + 5, 76, 14, "到站", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL2_VALUE_X + 2, HEADER_TOP + ROW_H * 2 + 5, 246, 14, "toStation", { fontSize: 10, textAlign: "center", lineHeight: 14 }),

  // Row 4: 发货地址 / 收货地址
  createStaticText(COL1_LABEL_X + 4, HEADER_TOP + ROW_H * 3 + 5, 66, 14, "发货地址", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL1_VALUE_X + 2, HEADER_TOP + ROW_H * 3 + 5, 86, 14, "fromAddress", { fontSize: 10, textAlign: "center", lineHeight: 14 }),
  createStaticText(COL2_LABEL_X + 4, HEADER_TOP + ROW_H * 3 + 5, 76, 14, "收货地址", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL2_VALUE_X + 2, HEADER_TOP + ROW_H * 3 + 5, 246, 14, "toAddress", { fontSize: 10, textAlign: "center", lineHeight: 14 }),

  // Row 5: 调拨日期 / 有效日期
  createStaticText(COL1_LABEL_X + 4, HEADER_TOP + ROW_H * 4 + 5, 66, 14, "调拨日期", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL1_VALUE_X + 2, HEADER_TOP + ROW_H * 4 + 5, 86, 14, "dispatchDate", { fontSize: 10, textAlign: "center", lineHeight: 14 }),
  createStaticText(COL2_LABEL_X + 4, HEADER_TOP + ROW_H * 4 + 5, 76, 14, "有效日期", { fontSize: 10, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
  createValueText(COL2_VALUE_X + 2, HEADER_TOP + ROW_H * 4 + 5, 246, 14, "effectiveDate", { fontSize: 10, textAlign: "center", lineHeight: 14 }),
];

// ========== 表格列定义（两行合并表头） ==========
const detailColumns = [
  [
    { title: "序号", field: "serialNo", width: 38, checked: true, columnId: "serialNo", rowspan: 2, colspan: 1, align: "center" },
    { title: "器材编码", field: "itemCode", width: 65, checked: true, columnId: "itemCode", rowspan: 2, colspan: 1, align: "center" },
    { title: "器材名称", field: "itemName", width: 75, checked: true, columnId: "itemName", rowspan: 2, colspan: 1, align: "center" },
    { title: "规格型号", field: "skuName", width: 75, checked: true, columnId: "skuName", rowspan: 2, colspan: 1, align: "center" },
    { title: "计量单位", field: "unitName", width: 45, checked: true, columnId: "unitName", rowspan: 2, colspan: 1, align: "center" },
    { title: "产品标识", field: "productIdentifier", width: 58, checked: true, columnId: "productIdentifier", rowspan: 2, colspan: 1, align: "center" },
    { title: "单价", field: "unitPrice", width: 48, checked: true, columnId: "unitPrice", rowspan: 2, colspan: 1, align: "center" },
    { title: "调拨", checked: true, rowspan: 1, colspan: 2, align: "center" },
    { title: "实发", checked: true, rowspan: 1, colspan: 2, align: "center" },
    { title: "实收", checked: true, rowspan: 1, colspan: 2, align: "center" },
    { title: "总价", field: "lineAmount", width: 52, checked: true, columnId: "lineAmount", rowspan: 2, colspan: 1, align: "center" },
    { title: "备注", field: "remark", width: 48, checked: true, columnId: "remark", rowspan: 2, colspan: 1, align: "center" },
  ],
  [
    { title: "数量", field: "dispatchQuantity", width: 42, checked: true, columnId: "dispatchQuantity", rowspan: 1, colspan: 1, align: "center" },
    { title: "等级", field: "dispatchLevel", width: 42, checked: true, columnId: "dispatchLevel", rowspan: 1, colspan: 1, align: "center" },
    { title: "数量", field: "actualDispatchQty", width: 42, checked: true, columnId: "actualDispatchQty", rowspan: 1, colspan: 1, align: "center" },
    { title: "等级", field: "actualDispatchLevel", width: 42, checked: true, columnId: "actualDispatchLevel", rowspan: 1, colspan: 1, align: "center" },
    { title: "数量", field: "actualReceiptQty", width: 42, checked: true, columnId: "actualReceiptQty", rowspan: 1, colspan: 1, align: "center" },
    { title: "等级", field: "actualReceiptLevel", width: 42, checked: true, columnId: "actualReceiptLevel", rowspan: 1, colspan: 1, align: "center" },
  ]
];

// ========== 表格/分页常量 ==========
const ROWS_PER_PAGE = 8;
const TABLE_TOP = 152;           // 头部区域下方
const TABLE_BOTTOM_LIMIT = 490;
const TABLE_HEADER_HEIGHT = 32;
const ROW_HEIGHT = (TABLE_BOTTOM_LIMIT - TABLE_TOP - TABLE_HEADER_HEIGHT) / ROWS_PER_PAGE;

const TABLE_ELEMENT_OPTIONS = {
  editable: true, columnDisplayEditable: true, columnDisplayIndexEditable: true,
  columnTitleEditable: true, columnResizable: true, columnAlignEditable: true,
  isEnableEditField: true, isEnableContextMenu: true, isEnableInsertRow: true,
  isEnableDeleteRow: true, isEnableInsertColumn: true, isEnableDeleteColumn: true, isEnableMergeCell: true
};

export function buildZhuanZhuangPanels(allRows) {
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

    // 签字区域（仅末页，三列对齐，间距35pt）
    const sigTop = TABLE_TOP + tableHeight + 35;
    const SIG_COL_W = 230;   // 每列宽度（加大避免拥挤）
    const SIG_GAP = 70;      // 列间距
    const COL1 = 30, COL2 = 30 + SIG_COL_W + SIG_GAP, COL3 = 30 + (SIG_COL_W + SIG_GAP) * 2;
    const signatureElements = isLastPage ? [
      // ---- 第1行：盖章标题 ----
      createStaticText(COL1, sigTop, SIG_COL_W, 18, "编制单位（盖章）：", { fontSize: 10, fontWeight: "600", lineHeight: 18 }),
      createStaticText(COL2, sigTop, SIG_COL_W, 18, "发货单位（盖章）：", { fontSize: 10, fontWeight: "600", lineHeight: 18 }),
      createStaticText(COL3, sigTop, SIG_COL_W, 18, "收货单位（盖章）：", { fontSize: 10, fontWeight: "600", lineHeight: 18 }),
      // ---- 第2行：___长（签名） ----
      createHLine(COL1, sigTop + 38, 28),
      createStaticText(COL1 + 28, sigTop + 22, 80, 20, "长（签名）：", { fontSize: 10, lineHeight: 20 }),
      createHLine(COL1 + 108, sigTop + 38, 122),
      createHLine(COL2, sigTop + 38, 28),
      createStaticText(COL2 + 28, sigTop + 22, 80, 20, "长（签名）：", { fontSize: 10, lineHeight: 20 }),
      createHLine(COL2 + 108, sigTop + 38, 122),
      createHLine(COL3, sigTop + 38, 28),
      createStaticText(COL3 + 28, sigTop + 22, 80, 20, "长（签名）：", { fontSize: 10, lineHeight: 20 }),
      createHLine(COL3 + 108, sigTop + 38, 122),
      // ---- 第3行：承办人/经手人 ----
      createStaticText(COL1, sigTop + 44, SIG_COL_W, 20, "承办人（签名）：", { fontSize: 10, lineHeight: 20 }),
      createHLine(COL1 + 90, sigTop + 60, 140),
      createStaticText(COL2, sigTop + 44, SIG_COL_W, 20, "发货经手人（签名）：", { fontSize: 10, lineHeight: 20 }),
      createHLine(COL2 + 105, sigTop + 60, 125),
      createStaticText(COL3, sigTop + 44, SIG_COL_W, 20, "收货经手人（签名）：", { fontSize: 10, lineHeight: 20 }),
      createHLine(COL3 + 105, sigTop + 60, 125),
      // ---- 第4~5行：留存选项（两行） ----
      createStaticText(COL1, sigTop + 68, SIG_COL_W, 12, "□调拨留存", { fontSize: 9, lineHeight: 12 }),
      createStaticText(COL1, sigTop + 82, SIG_COL_W, 12, "□返回调拨机关留存", { fontSize: 9, lineHeight: 12 }),
      createStaticText(COL2, sigTop + 68, SIG_COL_W, 12, "□发货单位留存", { fontSize: 9, lineHeight: 12 }),
      createStaticText(COL2, sigTop + 82, SIG_COL_W, 12, "□返回发货单位留存", { fontSize: 9, lineHeight: 12 }),
      createStaticText(COL3, sigTop + 68, SIG_COL_W, 12, "□收货单位留存", { fontSize: 9, lineHeight: 12 }),
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

export default { buildZhuanZhuangPanels, ROWS_PER_PAGE };
