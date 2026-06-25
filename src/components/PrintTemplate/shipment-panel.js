const createStaticText = (left, top, width, height, text, extra = {}) => ({
  options: {
    left,
    top,
    width,
    height,
    title: text,
    coordinateSync: false,
    widthHeightSync: false,
    ...extra
  },
  printElementType: {
    title: "文本",
    type: "text"
  }
});

const createFieldText = (left, top, width, height, title, field, extra = {}) => ({
  options: {
    left,
    top,
    width,
    height,
    title,
    field,
    fields: [{ text: title, field }],
    coordinateSync: false,
    widthHeightSync: false,
    ...extra
  },
  printElementType: {
    title: "文本",
    type: "text"
  }
});

const createValueText = (left, top, width, height, field, extra = {}) => ({
  options: {
    left,
    top,
    width,
    height,
    title: "",
    field,
    fields: [{ text: "", field }],
    coordinateSync: false,
    widthHeightSync: false,
    ...extra
  },
  printElementType: {
    title: "文本",
    type: "text"
  }
});

const createRect = (left, top, width, height, extra = {}) => ({
  options: {
    left,
    top,
    width,
    height,
    ...extra
  },
  printElementType: {
    title: "矩形",
    type: "rect"
  }
});

const createHLine = (left, top, width, extra = {}) => ({
  options: {
    left,
    top,
    width,
    ...extra
  },
  printElementType: {
    title: "横线",
    type: "hline"
  }
});

const createVLine = (left, top, height, extra = {}) => ({
  options: {
    left,
    top,
    height,
    ...extra
  },
  printElementType: {
    title: "竖线",
    type: "vline"
  }
});

const detailColumns = [
  [
    { title: "序号", field: "serialNo", width: 42, checked: true, columnId: "serialNo", rowspan: 1, colspan: 1, align: "center" },
    { title: "名称", field: "itemName", width: 82, checked: true, columnId: "itemName", rowspan: 1, colspan: 1, align: "center" },
    { title: "规格型号", field: "skuName", width: 82, checked: true, columnId: "skuName", rowspan: 1, colspan: 1, align: "center" },
    { title: "计量单位", field: "unitName", width: 52, checked: true, columnId: "unitName", rowspan: 1, colspan: 1, align: "center" },
    { title: "调拨数量\n等级", field: "dispatchLevel", width: 62, checked: true, columnId: "dispatchLevel", rowspan: 1, colspan: 1, align: "center" },
    { title: "调拨数量\n数量", field: "dispatchQuantity", width: 48, checked: true, columnId: "dispatchQuantity", rowspan: 1, colspan: 1, align: "center" },
    { title: "出库数量\n等级", field: "shipmentLevel", width: 62, checked: true, columnId: "shipmentLevel", rowspan: 1, colspan: 1, align: "center" },
    { title: "出库数量\n数量", field: "shipmentQuantity", width: 48, checked: true, columnId: "shipmentQuantity", rowspan: 1, colspan: 1, align: "center" },
    { title: "单价\n（元）", field: "unitPrice", width: 54, checked: true, columnId: "unitPrice", rowspan: 1, colspan: 1, align: "center" },
    { title: "总价\n（元）", field: "lineAmount", width: 54, checked: true, columnId: "lineAmount", rowspan: 1, colspan: 1, align: "center" },
    { title: "备注", field: "remark", width: 58, checked: true, columnId: "remark", rowspan: 1, colspan: 1, align: "center" }
  ]
];

export default {
  panels: [
    {
      index: 0,
      name: 1,
      height: 297,
      width: 210,
      paperHeader: 35,
      paperFooter: 780,
      printElements: [
        createStaticText(220, 40, 150, 24, "器材出库单", {
          fontSize: 18,
          fontWeight: "700",
          textAlign: "center",
          lineHeight: 22
        }),
        createStaticText(76, 118, 120, 44, "出库通知单", {
          fontSize: 16,
          fontWeight: "700",
          textAlign: "center",
          lineHeight: 20
        }),

        createRect(245, 92, 310, 93),
        createVLine(315, 92, 93),
        createVLine(400, 92, 93),
        createVLine(470, 92, 93),
        createHLine(245, 123, 310),
        createHLine(245, 154, 310),

        createStaticText(250, 101, 60, 14, "调拨根据", { fontSize: 11.5, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
        createValueText(323, 101, 72, 14, "basisNo", { fontSize: 11.5, textAlign: "center", lineHeight: 14 }),
        createStaticText(405, 101, 60, 14, "调拨方式", { fontSize: 11.5, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
        createValueText(478, 101, 72, 14, "dispatchMode", { fontSize: 11.5, textAlign: "center", lineHeight: 14 }),

        createStaticText(250, 132, 60, 14, "通知机关", { fontSize: 11.5, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
        createValueText(323, 132, 72, 14, "noticeOrg", { fontSize: 11.5, textAlign: "center", lineHeight: 14 }),
        createStaticText(405, 132, 60, 14, "收物单位", { fontSize: 11.5, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
        createValueText(478, 132, 72, 14, "receiveUnit", { fontSize: 11.5, textAlign: "center", lineHeight: 14 }),

        createStaticText(250, 163, 60, 14, "采购日期", { fontSize: 11.5, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
        createValueText(320, 163, 75, 14, "purchaseDate", { fontSize: 10.5, textAlign: "center", lineHeight: 14 }),
        createStaticText(405, 163, 60, 14, "出库日期", { fontSize: 11.5, fontWeight: "600", textAlign: "center", lineHeight: 14 }),
        createValueText(472, 163, 78, 14, "shipmentDate", { fontSize: 10.5, textAlign: "center", lineHeight: 14 }),

        {
          options: {
            left: 14,
            top: 240,
            height: 305,
            width: 548,
            field: "table",
            columns: detailColumns
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

        createFieldText(20, 602, 180, 18, "采购（配发）人", "purchaserName", { fontSize: 12, fontWeight: "600" }),
        createFieldText(230, 602, 130, 18, "验收人", "acceptorName", { fontSize: 12, fontWeight: "600" }),
        createFieldText(420, 602, 125, 18, "保管员", "keeperName", { fontSize: 12, fontWeight: "600" })
      ],
      paperNumberLeft: 565.5,
      paperNumberTop: 819,
      paperNumberContinue: true,
      watermarkOptions: {}
    }
  ]
};
