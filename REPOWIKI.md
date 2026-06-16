# RuoYi-WMS-VUE-Advance 项目知识库文档

> 版本：5.2.0（后端）/ 4.8.2（前端）  
> 作者：ZCC  
> 开源地址：https://gitee.com/zccbbg/ruoyi-wms-vue  
> 文档生成日期：2026-06-05

---

## 一、项目整体架构说明

### 1.1 项目定位

RuoYi-WMS-VUE-Advance 是基于 RuoYi-Vue-Plus 框架开发的**仓库管理系统 Advance 版**，提供多仓库+多库区管理能力，支持**一物一码**、SN追溯、生产日期/过期日期追踪等高级特性。项目采用前后端分离架构，前端为 Vue3 单页应用，后端为 Spring Boot 3 单体应用。

### 1.2 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.2.45 | 前端框架 |
| Element Plus | 2.2.27 | UI组件库 |
| Vite | 3.2.3 | 构建工具 |
| Pinia | 2.0.22 | 状态管理 |
| Vue Router | 4.1.4 | 路由管理 |
| Axios | 0.27.2 | HTTP请求 |
| ECharts | 5.4.0 | 图表可视化 |
| vue-plugin-hiprint | ^0.0.56 | 打印插件 |
| jsbarcode | ^3.11.6 | 条形码生成 |
| qrcode | ^1.5.3 | 二维码生成 |
| Sass | 1.56.1 | CSS预处理器 |

### 1.3 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Spring Boot | 3.2.6 | 应用框架 |
| Java | 17 | 编程语言 |
| MyBatis-Plus | 3.5.6 | ORM框架 |
| Sa-Token | 1.37.0 | 权限认证（JWT） |
| Redisson | 3.29.0 | Redis客户端/分布式锁 |
| Lock4j | 2.2.7 | 分布式锁 |
| Hutool | 5.8.27 | 工具类库 |
| MapStruct-Plus | 1.3.6 | 对象映射 |
| EasyExcel | 3.3.4 | Excel导入导出 |
| SpringDoc | 2.5.0 | API文档 |
| P6Spy | 3.9.1 | SQL性能分析 |
| Dynamic-DS | 4.3.0 | 多数据源 |
| AWS S3 SDK | 1.12.540 | 对象存储 |
| SMS4J | 2.2.0 | 短信服务 |
| Spring Boot Admin | 3.2.3 | 应用监控 |
| Undertow | - | Web服务器 |

### 1.4 数据库设计

- **数据库**：MySQL 8.0+，数据库名 `wms_advence_master`
- **字符集**：utf8mb4
- **主键策略**：雪花算法（ASSIGN_ID）
- **表数量**：系统表 15 张 + WMS业务表 21 张
- **缓存**：Redis + Redisson

### 1.5 整体架构图

```
┌─────────────────────────────────────────────────────┐
│                    浏览器（Vue3 SPA）                  │
│  ┌────────┐ ┌──────────┐ ┌─────────┐ ┌───────────┐ │
│  │ 基础资料│ │  作业中心 │ │ 库内管理 │ │  库存中心  │ │
│  └────┬───┘ └─────┬────┘ └────┬────┘ └─────┬─────┘ │
└───────┼───────────┼───────────┼─────────────┼───────┘
        │           │           │             │
   ─────┴───────────┴───────────┴─────────────┴──────
        │     /dev-api → http://localhost:8080  │
   ─────┴──────────────────────────────────────┴──────
        │           │           │             │
┌───────┴───────────┴───────────┴─────────────┴───────┐
│              Spring Boot 3（Undertow :8080）          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │Controller│ │  Service  │ │  Mapper   │            │
│  └─────┬────┘ └─────┬────┘ └─────┬────┘            │
│        │            │            │                    │
│  ┌─────┴────┐ ┌─────┴────┐ ┌─────┴────┐            │
│  │ Sa-Token  │ │ MyBatis- │ │  Redis   │            │
│  │   JWT     │ │  Plus    │ │ Redisson │            │
│  └──────────┘ └─────┬────┘ └──────────┘            │
└─────────────────────┼──────────────────────────────┘
                      │
              ┌───────┴───────┐
              │  MySQL 8.0    │
              │ wms_advence   │
              │   _master     │
              └───────────────┘
```

---

## 二、前端项目结构分析

### 2.1 目录结构

```
src/
├── api/                    # API接口定义
│   ├── wms/                # WMS业务接口（23个模块）
│   │   ├── warehouse.js    # 仓库管理
│   │   ├── area.js         # 库区管理
│   │   ├── rack.js         # 货架管理
│   │   ├── location.js     # 货位管理
│   │   ├── item.js         # 器材管理
│   │   ├── itemCategory.js # 器材分类
│   │   ├── itemSku.js      # 器材规格
│   │   ├── itemInstance.js # 器材实例
│   │   ├── box.js          # 箱体管理
│   │   ├── merchant.js     # 往来单位
│   │   ├── receiptOrder.js          # 入库单
│   │   ├── receiptOrderDetail.js    # 入库单明细
│   │   ├── shipmentOrder.js         # 出库单
│   │   ├── shipmentOrderDetail.js   # 出库单明细
│   │   ├── movementOrder.js         # 调拨单
│   │   ├── movementOrderDetail.js   # 调拨单明细
│   │   ├── checkOrder.js            # 盘点单
│   │   ├── inventory.js             # 库存
│   │   ├── inventoryDetail.js       # 库存明细
│   │   ├── inventoryHistory.js      # 库存流水
│   │   ├── borrowRecord.js          # 借还记录
│   │   └── storageLayout.js         # 仓储布局
│   ├── system/             # 系统管理接口
│   ├── monitor/            # 监控接口
│   ├── tool/               # 工具接口
│   ├── demo/               # 演示接口
│   ├── login.js            # 登录接口
│   └── menu.js             # 菜单接口
├── assets/                 # 静态资源
│   ├── icons/svg/          # SVG图标（80+）
│   ├── images/             # 图片
│   ├── logo/               # Logo
│   └── styles/             # 全局样式（8个SCSS文件）
├── components/             # 全局组件
│   ├── Breadcrumb/         # 面包屑导航
│   ├── DictTag/            # 字典标签
│   ├── Editor/             # 富文本编辑器
│   ├── FileUpload/         # 文件上传
│   ├── Hamburger/          # 侧边栏折叠按钮
│   ├── HeaderSearch/       # 头部搜索
│   ├── IconSelect/         # 图标选择
│   ├── ImagePreview/       # 图片预览
│   ├── ImageUpload/        # 图片上传
│   ├── Pagination/         # 分页组件
│   ├── ParentView/         # 父级路由视图
│   ├── PrintTemplate/      # 打印模板组件
│   ├── RightToolbar/       # 表格右侧工具栏
│   ├── RuoYi/              # RuoYi图标
│   ├── Screenfull/         # 全屏切换
│   ├── SizeSelect/         # 尺寸选择
│   ├── SvgIcon/            # SVG图标组件
│   ├── TopNav/             # 顶部导航
│   ├── TreeSelect/         # 树选择组件
│   └── iFrame/             # 内嵌框架
├── directive/              # 自定义指令
│   ├── common/             # 通用指令
│   ├── permission/         # 权限指令
│   └── index.js
├── layout/                 # 布局组件
│   ├── components/         # 布局子组件
│   │   ├── AppMain.vue
│   │   ├── Navbar/
│   │   ├── Settings/
│   │   ├── Sidebar/
│   │   └── TagsView/
│   └── index.vue
├── plugins/                # 插件
│   ├── auth.js             # 权限方法
│   ├── cache.js            # 缓存方法
│   ├── download.js         # 下载方法
│   ├── index.js            # 插件注册
│   ├── modal.js            # 弹窗方法
│   └── tab.js              # 标签页方法
├── router/                 # 路由配置
│   └── index.js            # 静态路由 + 动态路由
├── store/                  # Pinia状态管理
│   ├── modules/
│   │   ├── app.js          # 应用状态
│   │   ├── dict.js         # 字典缓存
│   │   ├── permission.js   # 权限路由
│   │   ├── settings.js     # 布局设置
│   │   ├── tagsView.js     # 标签页视图
│   │   ├── user.js         # 用户状态
│   │   └── wms.js          # WMS业务状态
│   └── index.js
├── utils/                  # 工具类
│   ├── auth.js             # Token管理
│   ├── dict.js             # 字典工具
│   ├── dynamicTitle.js     # 动态标题
│   ├── errorCode.js        # 错误码
│   ├── getRowSpanMethod.js # 表格行合并
│   ├── gogocodeTransfer.js # 代码转换
│   ├── index.js            # 通用工具
│   ├── jsencrypt.js        # RSA加密
│   ├── permission.js       # 权限判断
│   ├── request.js          # Axios封装
│   ├── routeResolver.js    # 路由解析
│   ├── ruoyi.js            # RuoYi工具函数
│   ├── scroll-to.js        # 滚动定位
│   ├── theme.js            # 主题管理
│   ├── validate.js         # 表单验证
│   └── wssPrintClient.js   # WSS打印客户端
├── views/                  # 页面视图
│   ├── wms/                # WMS业务页面
│   │   ├── basic/          # 基础资料
│   │   │   ├── warehouse/  # 仓库管理
│   │   │   ├── area/       # 库区管理
│   │   │   ├── rack/       # 货架管理
│   │   │   ├── location/   # 货位管理
│   │   │   ├── item/       # 器材管理
│   │   │   ├── merchant/   # 往来单位
│   │   │   ├── box/        # 箱体管理
│   │   │   └── layout/     # 仓储布局
│   │   ├── order/          # 作业中心
│   │   │   ├── receipt/    # 入库作业
│   │   │   ├── shipment/   # 出库作业
│   │   │   ├── movement/   # 调拨作业
│   │   │   └── check/      # 盘点作业
│   │   ├── business/       # 业务功能
│   │   │   └── borrow-record/  # 借还管理
│   │   ├── inventory/      # 库存流水
│   │   │   └── history.vue
│   │   ├── itemInstance/   # 器材实例台账
│   │   │   ├── index.vue
│   │   │   └── ItemInstancePage.vue
│   ├── components/         # 业务组件（7个）
│   ├── demo/               # 演示页面
│   ├── error/              # 错误页面（401/404）
│   ├── monitor/            # 系统监控页面
│   ├── redirect/           # 路由重定向
│   ├── system/             # 系统管理页面
│   ├── tool/               # 系统工具页面
│   ├── index.vue           # 首页
│   ├── login.vue           # 登录页
│   └── register.vue        # 注册页
├── App.vue                 # 根组件
├── main.js                 # 入口文件
├── permission.js           # 路由权限控制
└── settings.js             # 全局设置
```

### 2.2 前端核心模块说明

#### 全局组件注册（main.js）

项目在 `main.js` 中全局注册了以下组件：
- **DictTag** - 字典标签组件，根据字典类型显示对应标签
- **Pagination** - 分页组件，封装了 el-pagination
- **TreeSelect** - 树选择组件
- **FileUpload** - 文件上传组件
- **ImageUpload** - 图片上传组件
- **ImagePreview** - 图片预览组件
- **RightToolbar** - 表格右侧工具栏（列显隐、搜索等）
- **Editor** - 富文本编辑器（基于 vue-quill）

#### 全局方法挂载

- `useDict` - 字典数据获取
- `getConfigKey/updateConfigByKey` - 系统参数配置
- `download` - 文件下载
- `parseTime` - 时间格式化
- `resetForm` - 表单重置
- `handleTree` - 树形数据处理
- `addDateRange` - 日期范围参数
- `selectDictLabel/selectDictLabels` - 字典标签转换

#### 状态管理（Pinia Store）

| 模块 | 文件 | 职责 |
|------|------|------|
| app | app.js | 侧边栏状态、设备类型 |
| dict | dict.js | 字典数据缓存 |
| permission | permission.js | 动态路由、菜单权限 |
| settings | settings.js | 主题、布局设置 |
| tagsView | tagsView.js | 标签页管理 |
| user | user.js | 用户信息、Token |
| wms | wms.js | WMS业务全局状态 |

#### 路由设计

- **静态路由（constantRoutes）**：登录、注册、404、401、首页、个人中心
- **动态路由（dynamicRoutes）**：基于权限动态加载，包括用户角色分配、字典数据、OSS配置、代码生成配置、器材实例、箱体管理、借还记录
- **菜单动态路由**：通过后端接口获取用户菜单权限，动态注册路由

---

## 三、后端项目结构分析

### 3.1 Maven 模块结构

```
wms-ruoyi-advance/
├── pom.xml                          # 父POM（版本管理、依赖声明）
├── ruoyi-admin-wms/                 # WMS应用启动模块
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/ruoyi/
│       │   ├── RuoYiApplication.java        # 启动类
│       │   ├── RuoYiServletInitializer.java  # WAR部署初始化
│       │   └── wms/                         # WMS业务代码
│       │       ├── controller/              # 控制层（22个）
│       │       ├── domain/                  # 领域模型
│       │       │   ├── bo/                   # 业务对象
│       │       │   ├── entity/              # 实体类（20个）
│       │       │   └── vo/                  # 视图对象（40+个）
│       │       ├── mapper/                  # 数据访问层（20个）
│       │       └── service/                 # 业务服务层（25+个）
│       └── resources/
│           ├── application.yml              # 主配置
│           ├── application-dev.yml          # 开发环境配置
│           ├── i18n/                        # 国际化
│           └── mapper/                      # MyBatis XML
├── ruoyi-common/                    # 通用模块
│   ├── ruoyi-common-bom/           # 依赖BOM
│   ├── ruoyi-common-core/          # 核心工具
│   ├── ruoyi-common-doc/           # 文档配置
│   ├── ruoyi-common-encrypt/       # 加密模块
│   ├── ruoyi-common-excel/         # Excel处理
│   ├── ruoyi-common-idempotent/    # 幂等性
│   ├── ruoyi-common-json/          # JSON处理
│   ├── ruoyi-common-log/           # 日志模块
│   ├── ruoyi-common-mail/          # 邮件模块
│   ├── ruoyi-common-mybatis/       # MyBatis配置
│   ├── ruoyi-common-oss/           # 对象存储
│   ├── ruoyi-common-ratelimiter/   # 限流模块
│   ├── ruoyi-common-redis/         # Redis配置
│   ├── ruoyi-common-satoken/       # Sa-Token认证
│   ├── ruoyi-common-security/      # 安全模块
│   ├── ruoyi-common-sensitive/     # 脱敏模块
│   ├── ruoyi-common-sms/           # 短信模块
│   └── ruoyi-common-translation/   # 翻译模块
├── ruoyi-modules/                   # 业务模块
│   ├── ruoyi-demo/                 # 演示模块
│   ├── ruoyi-generator/            # 代码生成模块
│   └── ruoyi-system/               # 系统管理模块
├── script/                          # 脚本
│   ├── bin/                        # 运行脚本
│   └── sql/                        # SQL脚本
│       └── wms_advence_master.sql  # 数据库初始化脚本
└── docs/                           # 文档
```

### 3.2 后端核心模块说明

#### Controller 层（22个控制器）

| 控制器 | 职责 |
|--------|------|
| WarehouseController | 仓库管理CRUD |
| AreaController | 库区管理CRUD |
| RackController | 货架管理CRUD |
| LocationController | 货位管理CRUD |
| ItemController | 器材管理CRUD + 批量打印二维码 |
| ItemCategoryController | 器材分类树形管理 |
| ItemSkuController | 器材规格管理 |
| ItemInstanceController | 器材实例管理 + 状态变更 + 位置变更 |
| BoxController | 箱体管理 + 装箱/拆箱操作 |
| MerchantController | 往来单位管理 |
| ReceiptOrderController | 入库单管理 + 执行入库 + 生成单号 |
| ReceiptOrderDetailController | 入库单明细管理 |
| ShipmentOrderController | 出库单管理 + 执行出库 |
| ShipmentOrderDetailController | 出库单明细管理 |
| MovementOrderController | 调拨单管理 + 执行调拨 |
| MovementOrderDetailController | 调拨单明细管理 |
| CheckOrderController | 盘点单管理 + 开始盘点 + 加载实例 + 完成盘点 |
| CheckOrderDetailController | 盘点单明细管理 |
| InventoryController | 库存管理 |
| InventoryDetailController | 库存明细管理 + 导出 |
| InventoryHistoryController | 库存流水记录 |
| BorrowRecordController | 借还记录 + 借出/归还操作 + 超期预警 |
| StorageLayoutController | 仓储布局可视化查询 |

#### Service 层（25+个服务）

| 服务 | 特殊职责 |
|------|----------|
| ReceiptOrderService | 入库操作 → 更新库存、创建器材实例、写库存流水 |
| ShipmentOrderService | 出库操作 → 扣减库存、更新实例状态、写库存流水 |
| MovementOrderService | 调拨操作 → 源仓出库+目标仓入库、更新实例位置 |
| CheckOrderService | 盘点操作 → 两级流程（申请→执行）、SKU级汇总、实例差异记录（不调整库存） |
| BorrowRecordService | 借出操作 → 更新实例状态为"借出"、写库存流水 |
| ItemService | 器材管理 + 批量打印二维码（含序列号生成） |
| ItemInstanceService | 器材实例生命周期管理 |
| BoxService | 箱体装箱/拆箱操作 |
| LocationService | 货位占用状态管理 + 健康检查 + 重建 |
| RackLocationPlannerService | 货架货位自动规划 |
| StorageLayoutQueryService | 仓储布局可视化数据查询 |

#### Domain 领域模型

**实体类（Entity）**：对应数据库表，共21个核心实体
- 仓储设施：Warehouse, Area, Rack, Location, Box
- 器材管理：Item, ItemCategory, ItemSku, ItemInstance, ItemQrCodeSerial
- 作业单据：ReceiptOrder/Detail, ShipmentOrder/Detail, MovementOrder/Detail, CheckOrder/Detail, CheckOrderInstance
- 库存管理：Inventory, InventoryDetail, InventoryHistory
- 业务对象：Merchant, BorrowRecord

**业务对象（Bo）**：用于接收前端请求参数
**视图对象（Vo）**：用于返回前端展示数据，含翻译字段

---

## 四、数据库表结构详细说明

### 4.1 系统表（15张）

| 表名 | 说明 | 核心字段 |
|------|------|----------|
| sys_config | 参数配置表 | config_id, config_key, config_value |
| sys_dept | 部门表 | dept_id, parent_id, ancestors, dept_name |
| sys_dict_data | 字典数据表 | dict_code, dict_type, dict_label, dict_value |
| sys_dict_type | 字典类型表 | dict_id, dict_type |
| sys_logininfor | 系统访问记录 | info_id, user_name, ipaddr, login_time |
| sys_menu | 菜单权限表 | menu_id, menu_name, perms, menu_type(M/C/F) |
| sys_notice | 通知公告表 | notice_id, notice_type, notice_content |
| sys_oper_log | 操作日志记录 | oper_id, business_type, oper_url |
| sys_oss | OSS对象存储 | oss_id, file_name, url |
| sys_oss_config | OSS对象配置 | oss_config_id, access_key, endpoint |
| sys_post | 岗位表 | post_id, post_code, post_name |
| sys_role | 角色表 | role_id, role_name, role_key |
| sys_role_dept | 角色部门关联 | role_id, dept_id |
| sys_user | 用户表 | user_id, user_name, nick_name, dept_id |
| gen_table / gen_table_column | 代码生成 | table_name, class_name |

### 4.2 WMS业务表（21张）

#### 4.2.1 仓储设施表

**wms_warehouse（仓库表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键（雪花ID） |
| warehouse_code | varchar(20) UK | 仓库编码（如WH1） |
| warehouse_name | varchar(50) | 仓库名称（如北京仓） |
| status | varchar(32) | 启用状态 |
| address | varchar(255) | 地址 |
| manager_name | varchar(64) | 负责人 |
| manager_phone | varchar(32) | 负责人电话 |
| order_num | bigint | 排序 |

**wms_area（库区表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| area_code | varchar(20) UK | 库区编码 |
| area_name | varchar(50) | 库区名称 |
| warehouse_id | bigint FK | 所属仓库 |

**wms_rack（货架表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| rack_code | varchar(32) | 货架编码（如WH1RACK1000000001） |
| rack_name | varchar(60) | 货架名称 |
| warehouse_id | bigint FK | 所属仓库 |
| area_id | bigint FK | 所属库区 |
| rack_status | varchar(32) | 货架状态（enabled/disabled） |
| row_count | int | 行数 |
| column_count | int | 列数 |
| length/width/height | decimal | 尺寸 |

**wms_location（货位表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| location_code | varchar(32) UK | 货位编码（如WH1RACK1000000001-R1-C1） |
| location_name | varchar(60) | 货位名称 |
| warehouse_id | bigint FK | 所属仓库 |
| area_id | bigint FK | 所属库区 |
| rack_id | bigint FK | 所属货架 |
| location_status | varchar(32) | 货位状态（enabled/disabled/occupied/abnormal） |
| row_no / column_no | int | 行列号 |
| occupied_flag | tinyint | 是否占用（0/1） |

**wms_box（箱体表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| box_code | varchar(64) UK | 箱码 |
| box_name | varchar(64) | 箱体名称 |
| box_status | varchar(32) | 箱体状态（idle/packed/outbound/disabled） |
| item_count | int | 箱内器材数量 |
| warehouse_id/area_id/rack_id/location_id | bigint | 位置信息 |

#### 4.2.2 器材管理表

**wms_item（器材主档）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| item_code | varchar(20) UK | 器材编码（如HUI-DYJ） |
| item_name | varchar(60) | 器材名称 |
| item_category | varchar(20) FK | 分类ID |
| unit | varchar(20) | 计量单位 |
| equipment_name | varchar(128) | 装备名称 |
| equipment_type | varchar(32) | 器材类型（通装/专装） |
| status | varchar(32) | 启用状态（1启用/0停用） |

**wms_item_category（器材分类表）** — 树形结构

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 分类ID |
| parent_id | bigint | 父分类ID（0为顶级） |
| category_name | varchar(30) | 分类名称 |
| order_num | int | 排序 |
| status | char(1) | 状态（0停用/1正常） |

**wms_item_sku（器材规格表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 规格ID |
| sku_name | varchar(255) | 规格名称（如2023、2024） |
| product_identifier | varchar(128) | 产品标识 |
| quality_grade | varchar(32) | 质量等级（高/中/低） |
| item_id | bigint FK | 所属器材 |
| status | varchar(32) | 启用状态 |

**wms_item_instance（器材实例表）** — 一物一码核心表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 实例ID |
| instance_code | varchar(64) UK | 实例编码（如WH1ITEM1000000001） |
| item_id | bigint FK | 器材ID |
| sku_id | bigint FK | 规格ID |
| instance_status | varchar(32) | 状态（待入库/在库/出库/借出/盘亏/报废） |
| warehouse_id/area_id/rack_id/location_id | bigint | 当前位置 |
| box_id | bigint FK | 当前所在箱体 |
| source_type | varchar(32) | 来源类型（入库单/调拨单等） |
| source_order_id | bigint | 来源单据ID |
| source_order_no | varchar(64) | 来源单据号 |
| receipt_order_detail_id | bigint | 来源入库单明细ID |
| shipment_order_detail_id | bigint | 来源出库单明细ID |

**wms_item_qr_code_serial（二维码序列表）**

| 字段 | 类型 | 说明 |
|------|------|------|
| item_key | varchar(255) PK | 器材唯一键（如WH1ITEM） |
| current_value | bigint | 当前可分配序列值（默认从1000000001开始） |

#### 4.2.3 作业单据表

**wms_receipt_order（入库单）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| receipt_order_no | varchar(32) | 入库单号（如RK05201617） |
| receipt_order_type | varchar(20) | 入库类型（采购入库/归还入库/调拨入库） |
| basis_no | varchar(64) | 调拨根据 |
| dispatch_mode | varchar(32) | 调拨方式（air/road/rail/sea） |
| notice_org | varchar(128) | 通知机关 |
| receive_unit | varchar(128) | 收物单位 |
| purchase_date | date | 采购日期 |
| receipt_date | date | 入库日期 |
| total_quantity | decimal | 器材总数 |
| payable_amount | decimal | 订单金额 |
| receipt_order_status | tinyint | 状态（0未入库/1已入库/-1作废） |
| warehouse_id | bigint FK | 目标仓库 |
| area_id | bigint FK | 目标库区 |

**wms_receipt_order_detail（入库单明细）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| receipt_order_id | bigint FK | 入库单ID |
| sku_id | bigint FK | 规格ID |
| quantity | decimal | 入库数量 |
| item_code/item_name/sku_name | varchar | 器材信息快照 |
| unit_price/line_amount | decimal | 单价/总价 |
| warehouse_id/area_id/rack_id/location_id | bigint | 入库目标位置 |
| box_code | varchar(64) | 箱码 |

**wms_shipment_order（出库单）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| shipment_order_no | varchar(32) | 出库单号（如CK05202806） |
| shipment_order_type | varchar(20) | 出库类型（借用出库/调拨出库/报废出库） |
| shipment_date | date | 出库日期 |
| total_quantity | decimal | 出库数量 |
| shipment_order_status | tinyint | 状态（0未出库/1已出库/-1作废） |
| warehouse_id/area_id | bigint | 出库来源 |

**wms_shipment_order_detail（出库单明细）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| shipment_order_id | bigint FK | 出库单ID |
| sku_id | bigint FK | 规格ID |
| quantity | decimal | 出库数量 |
| inventory_detail_id | bigint FK | 关联入库记录（先进先出） |
| item_instance_id | bigint FK | 器材实例ID（一物一码出库） |
| box_id | bigint FK | 箱体ID（整箱出库） |

**wms_movement_order（调拨单）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| movement_order_no | varchar(32) | 调拨单号（如DB05217966） |
| movement_type | varchar(32) | 调拨类型（通装/专装） |
| dispatch_basis | varchar(255) | 调拨依据 |
| dispatch_purpose | varchar(255) | 调拨目的 |
| dispatch_mode | varchar(32) | 调拨方式（air/road/rail/sea） |
| from_unit/to_unit | varchar(128) | 发货/收货单位 |
| from_station/to_station | varchar(128) | 发站/到站 |
| dispatch_date/effective_date/issue_date | date | 调拨/有效/发出日期 |
| source_warehouse_id/source_area_id | bigint | 源仓库/库区 |
| target_warehouse_id/target_area_id | bigint | 目标仓库/库区 |
| movement_order_status | tinyint | 状态（0未移库/1已移库/-1作废） |

**wms_movement_order_detail（调拨单明细）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| movement_order_id | bigint FK | 调拨单ID |
| sku_id | bigint FK | 规格ID |
| quantity | decimal | 数量 |
| source_warehouse_id/area_id/rack_id/location_id | bigint | 源位置 |
| target_warehouse_id/area_id/rack_id/location_id | bigint | 目标位置 |
| inventory_detail_id | bigint FK | 关联入库记录 |
| item_instance_id | bigint FK | 器材实例ID |

**wms_check_order（盘点单）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| check_order_no | varchar(32) | 盘点单号（如PK05212439） |
| check_scope_type | varchar(32) | 盘点范围（warehouse/area/rack） |
| check_order_status | tinyint | 状态（0待盘点/1已完成/-1作废） |
| check_order_total | decimal | 盈亏数 |
| warehouse_id/area_id/rack_id | bigint | 盘点范围 |
| check_date | datetime | 盘点日期 |
| checker_name/reviewer_name | varchar | 盘点人/复核人 |

**wms_check_order_detail（盘点单明细）** — SKU级汇总

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| check_order_id | bigint FK | 盘点单ID |
| sku_id | bigint FK | 规格ID |
| quantity | decimal | 账面数量（系统汇总） |
| check_quantity | decimal | 盘点数量（实盘数） |
| difference_quantity | decimal | 差异数量 |
| profit_and_loss | decimal | 盈亏数（实际-账面） |
| warehouse_id/area_id/rack_id | bigint | 位置信息 |

**wms_check_order_instance（盘点实例差异表）** — 记录盘亏/盘盈实例明细

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| check_order_id | bigint FK | 盘点单ID |
| check_order_detail_id | bigint FK | 盘点明细ID |
| sku_id | bigint FK | 规格ID |
| item_instance_id | bigint FK | 器材实例ID（盘亏时有值） |
| instance_code | varchar(64) | 实例编码 |
| instance_item_name | varchar(128) | 器材名称快照 |
| result_type | varchar(16) | 差异类型（loss=盘亏/gain=盘盈） |
| remark | varchar(255) | 备注 |

#### 4.2.4 库存管理表

**wms_inventory（库存表）** — 按位置+规格聚合

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| sku_id | bigint FK | 规格ID |
| warehouse_id/area_id/rack_id/location_id | bigint | 位置 |
| quantity | decimal | 库存数量 |

> 唯一索引：`uk_wms_inventory_position_sku(warehouse_id, area_id, rack_id, location_id, sku_id)`

**wms_inventory_detail（库存详情）** — 每笔入库明细（支持先进先出）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| receipt_order_id | bigint FK | 入库单ID |
| type | int | 类型（1入库/2移库/3盘库） |
| sku_id | bigint FK | 规格ID |
| warehouse_id/area_id/rack_id/location_id | bigint | 位置 |
| item_instance_id | bigint FK | 器材实例ID |
| box_id | bigint FK | 箱体ID |
| source_order_type | varchar(32) | 来源单据类型 |
| source_order_id | bigint | 来源单据ID |
| quantity | decimal | 入库数量 |
| remain_quantity | decimal | 剩余数量 |
| unit_price/line_amount | decimal | 单价/总价 |

**wms_inventory_history（库存流水）** — 全量操作记录

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| warehouse_id/area_id/rack_id/location_id | bigint | 位置 |
| item_instance_id | bigint FK | 器材实例ID |
| box_id | bigint FK | 箱体ID |
| before_quantity/after_quantity | decimal | 变化前后数量 |
| operation_type | varchar(32) | 业务动作（borrow/return等） |
| operator_name | varchar(64) | 操作人 |
| sku_id | bigint FK | 规格ID |
| quantity | decimal | 变化数量 |
| order_id/order_no | bigint/varchar | 关联单据 |
| order_type | int | 操作类型（1入库/2出库/3移库/4盘库/5借用/6归还/7调整） |

#### 4.2.5 借还管理表

**wms_borrow_record（借还记录）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| item_instance_id | bigint FK | 器材实例ID |
| borrow_status | varchar(32) | 借还状态（borrowed/returned） |
| borrower_name | varchar(64) | 借用人 |
| borrow_unit | varchar(128) | 借用单位 |
| borrow_purpose | varchar(255) | 借用目的 |
| borrow_time | datetime | 借用时间 |
| borrow_no | varchar(64) UK | 借用单号（如BR2057102396983975936） |
| return_deadline | date | 归还期限 |
| overdue_flag | tinyint | 是否超期（0正常/1超期） |
| return_time | datetime | 实际归还时间 |
| original_warehouse_id/area_id/rack_id/location_id/box_id | bigint | 借出前位置 |
| returned_warehouse_id/area_id/rack_id/location_id/box_id | bigint | 归还后位置 |

**wms_merchant（往来单位）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 主键 |
| merchant_code | varchar(20) | 单位编号 |
| merchant_name | varchar(60) | 单位名称 |
| address | varchar(200) | 地址 |
| mobile/tel | varchar(13) | 手机/座机 |
| contact_person | varchar(30) | 联系人 |
| email | varchar(50) | 邮箱 |

### 4.3 表关系图

```
wms_warehouse ──1:N──> wms_area ──1:N──> wms_rack ──1:N──> wms_location
     │                   │                   │                  │
     └───────────────────┴───────────────────┴──────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              wms_inventory  wms_inventory_detail  wms_inventory_history
                    │               │               │
                    └───────────────┴───────────────┘
                                    │
        ┌──────────┬────────────────┼────────────────┬──────────┐
        │          │                │                │          │
  wms_receipt   wms_shipment   wms_movement    wms_check    wms_borrow
  _order/detail _order/detail  _order/detail   _order/detail _record
        │          │                │                │          │
        └──────────┴────────────────┴────────────────┘
                                    │
                          wms_item_instance
                         ┌───────┴───────┐
                         │               │
                    wms_item_sku      wms_box
                         │
                    wms_item ──> wms_item_category
```

### 4.4 核心业务字典

| 字典类型 | 字典标签 | 说明 |
|----------|----------|------|
| wms_receipt_status | 0=未入库, 1=已入库, -1=作废 | 入库单状态 |
| wms_receipt_type | 采购入库/归还入库/调拨入库 | 入库类型 |
| wms_shipment_status | 0=未出库, 1=已出库, -1=作废 | 出库单状态 |
| wms_shipment_type | 借用出库/调拨出库/报废出库 | 出库类型 |
| wms_movement_status | 0=未移库, 1=已移库, -1=作废 | 调拨单状态 |
| wms_movement_type | 通装/专装 | 调拨类型 |
| wms_check_status | 0=待盘点, 1=已完成, -1=作废 | 盘点单状态 |
| wms_check_scope_type | warehouse/area/rack | 盘点范围类型 |
| wms_dispatch_mode | air/road/rail/sea | 调拨方式 |
| wms_item_instance_status | 待入库/在库/出库/借出/盘亏/报废 | 器材实例状态 |
| wms_item_status | 1=启用, 0=停用 | 器材主档状态 |
| wms_item_sku_status | 1=启用, 0=停用 | 器材规格状态 |
| wms_rack_status | enabled/disabled | 货架状态 |
| wms_location_status | enabled/disabled/occupied/abnormal | 货位状态 |
| wms_box_status | idle/packed/outbound/disabled | 箱体状态 |
| wms_borrow_status | borrowed/returned | 借还状态 |
| wms_overdue_flag | 0=正常, 1=已超期 | 超期状态 |
| wms_equipment_type | 通装/专装 | 器材类型 |
| wms_inventory_history_type | 1=入库,2=出库,3=移库,4=盘库,5=借用,6=归还,7=调整 | 库存流水类型 |

---

## 五、主要业务流程梳理

### 5.1 入库流程

```
创建入库单 → 添加入库明细（选择器材+规格+入库位置+箱码） → 执行入库
                                                              │
                            ┌─────────────────────────────────┤
                            │                                 │
                    ① 更新入库单状态为"已入库"           ② 创建器材实例
                            │                                 │（生成唯一编码WH1ITEMxxxx）
                    ③ 创建库存详情记录                      │
                            │                                 │
                    ④ 更新/创建库存汇总                    ⑤ 更新实例状态为"在库"
                            │                                 │
                    ⑤ 写入库存流水记录                   ⑥ 更新货位占用状态
```

**入库类型**：
- **采购入库**：新建入库单 → 指定仓库/库区 → 添加明细 → 执行入库
- **归还入库**：借出器材归还 → 自动生成归还入库单
- **调拨入库**：调拨单执行后自动生成入库记录

### 5.2 出库流程

```
创建出库单 → 添加出库明细（选择器材+规格+指定出库实例/箱体） → 执行出库
                                                                 │
                            ┌────────────────────────────────────┤
                            │                                  │
                    ① 更新出库单状态为"已出库"          ② 扣减库存详情剩余数量
                            │                                  │
                    ③ 扣减库存汇总数量                    ④ 更新实例状态为"出库"
                            │                                  │
                    ⑤ 写入库存流水记录                   ⑥ 更新货位占用状态
                            │
                    ⑦ 更新箱体状态（如整箱出库）
```

**出库类型**：
- **借用出库**：器材借出 → 同时创建借还记录
- **调拨出库**：调拨单执行时自动出库
- **报废出库**：器材报废处理

### 5.3 调拨流程

```
创建调拨单 → 填写调拨信息（类型/方式/源仓库/目标仓库） → 添加调拨明细 → 执行调拨
                                                                        │
                        ┌───────────────────────────────────────────────┤
                        │                                               │
                ① 源仓出库操作                                    ② 目标仓入库操作
                （扣减源仓库存、写流水）                        （增加目标仓库存、写流水）
                        │                                               │
                ③ 更新器材实例位置                                  ④ 更新调拨单状态为"已移库"
```

**调拨特性**：
- 支持**通装/专装**两种调拨类型
- 支持**空运/公路/铁路/水运**四种调拨方式
- 调拨单包含完整的军事物流信息：调拨依据、调拨目的、发货单位、收货单位、发站、到站、通信地址
- 支持指定精确到货位的源/目标位置

### 5.4 盘点流程（两级流程：申请 → 执行）

```
第一级：提交盘点申请
  申请人选择盘点范围（仓库/库区/货架） → 填写盘点人/复核人/备注 → 提交申请
  → 生成盘点单（status=0 待盘点，无明细数据）

第二级：执行盘点
  盘点人打开待盘点单 → 点击"开始盘点" → 系统从 wms_inventory 按 sku_id 汇总加载账面库存
  → 逐项填写实际数量 → 展开差异行查看/编辑实例差异明细 → 完成盘点
                                                                                    │
                            ┌──────────────────────────────────────────────────────┤
                            │                                                      │
                    ① 计算差异（实际-账面）                                    ② 保存实例差异记录
                            │                                                      │
                    ③ 更新盘点单状态为"已完成"                              ④ 记录盈亏数（不调整库存）
```

**设计要点**：
- **SKU级汇总**：盘点明细按器材规格（SKU）展示账面数量，而非逐实例展示
- **只记录不调整**：盘点完成后仅记录差异，不修改库存表、不更新实例状态、不写库存流水
- **实例差异记录**：新增 `wms_check_order_instance` 表，记录盘亏/盘盈的具体实例编码和备注
- **集合运算**：后端通过 `账面实例编码 - 已扫描编码 = 盘亏`，`已扫描编码 - 账面实例编码 = 盘盈` 自动计算差异
- **懒加载**：前端仅在产生盈亏的SKU行展开时才加载实例列表，避免大数据量性能问题
- **支持盘盈**：盘盈时允许手动添加实例编码

### 5.5 借还流程

```
借出：选择在库器材实例 → 填写借用人/单位/目的/归还期限 → 执行借出
                                                              │
                    ① 创建借还记录（状态borrowed）
                    ② 更新实例状态为"借出"
                    ③ 扣减库存
                    ④ 写入库存流水（operation_type=borrow）
                    ⑤ 记录借出前位置信息

归还：选择借还记录 → 填写归还位置 → 执行归还
                              │
                    ① 更新借还记录状态为returned
                    ② 更新实例状态为"在库"
                    ③ 恢复库存
                    ④ 写入库存流水（operation_type=return）
                    ⑤ 记录归还后位置信息
                    ⑥ 更新归还时间
```

**超期预警**：系统支持通过 `GET /wms/borrowRecord/warning/stats` 获取超期预警统计。

### 5.6 箱体管理流程

```
装箱：选择空箱 → 添加器材实例到箱体 → 执行装箱
                ① 更新箱体状态为packed
                ② 更新器材实例的box_id
                ③ 更新箱体item_count

拆箱：选择已装箱体 → 移除器材实例 → 执行拆箱
                ① 更新箱体状态为idle
                ② 清除器材实例的box_id
                ③ 更新箱体item_count

整箱出库：出库时选择箱体 → 所有箱内器材同时出库
                ① 更新箱体状态为outbound
                ② 更新所有箱内实例状态为"出库"
```

---

## 六、API接口文档整理

### 6.1 仓库管理 `/wms/warehouse`

| 方法 | URL | 说明 |
|------|-----|------|
| GET | /wms/warehouse/list | 分页查询仓库列表 |
| GET | /wms/warehouse/listNoPage | 查询仓库列表（不分页） |
| GET | /wms/warehouse/{id} | 查询仓库详情 |
| POST | /wms/warehouse | 新增仓库 |
| PUT | /wms/warehouse | 修改仓库 |
| DELETE | /wms/warehouse/{id} | 删除仓库 |
| POST | /wms/warehouse/update/orderNum | 更新仓库排序 |

### 6.2 器材管理 `/wms/item`

| 方法 | URL | 说明 |
|------|-----|------|
| GET | /wms/item/list | 分页查询器材列表 |
| GET | /wms/item/listNoPage | 查询器材列表（不分页） |
| GET | /wms/item/{id} | 查询器材详情 |
| POST | /wms/item | 新增器材 |
| PUT | /wms/item | 修改器材 |
| DELETE | /wms/item/{id} | 删除器材 |
| POST | /wms/item/batchPrintQrCode | 批量打印器材二维码 |

### 6.3 入库管理 `/wms/receiptOrder`

| 方法 | URL | 说明 |
|------|-----|------|
| GET | /wms/receiptOrder/list | 分页查询入库单列表 |
| GET | /wms/receiptOrder/{id} | 查询入库单详情 |
| POST | /wms/receiptOrder | 新增入库单 |
| PUT | /wms/receiptOrder | 修改入库单 |
| DELETE | /wms/receiptOrder/{id} | 删除入库单 |
| POST | /wms/receiptOrder/warehousing | 执行入库操作 |
| GET | /wms/receiptOrder/generate/no | 生成入库单号 |

### 6.4 出库管理 `/wms/shipmentOrder`

| 方法 | URL | 说明 |
|------|-----|------|
| GET | /wms/shipmentOrder/list | 分页查询出库单列表 |
| GET | /wms/shipmentOrder/{id} | 查询出库单详情 |
| POST | /wms/shipmentOrder | 新增出库单 |
| PUT | /wms/shipmentOrder | 修改出库单 |
| DELETE | /wms/shipmentOrder/{id} | 删除出库单 |
| PUT | /wms/shipmentOrder/shipment | 执行出库操作 |

### 6.5 调拨管理 `/wms/movementOrder`

| 方法 | URL | 说明 |
|------|-----|------|
| GET | /wms/movementOrder/list | 分页查询调拨单列表 |
| GET | /wms/movementOrder/{id} | 查询调拨单详情 |
| POST | /wms/movementOrder | 新增调拨单 |
| PUT | /wms/movementOrder | 修改调拨单 |
| DELETE | /wms/movementOrder/{id} | 删除调拨单 |
| POST | /wms/movementOrder/move | 执行调拨操作 |

### 6.6 盘点管理 `/wms/checkOrder`

| 方法 | URL | 说明 |
|------|-----|------|
| GET | /wms/checkOrder/list | 分页查询盘点单列表 |
| GET | /wms/checkOrder/{id} | 查询盘点单详情（含实例差异） |
| POST | /wms/checkOrder | 新增盘点单（申请阶段，无明细） |
| PUT | /wms/checkOrder | 修改盘点单 |
| DELETE | /wms/checkOrder/{id} | 删除盘点单 |
| POST | /wms/checkOrder/startCheck/{id} | 开始盘点（加载SKU级账面库存） |
| GET | /wms/checkOrder/instances/{checkOrderId}?skuId=xxx | 懒加载指定SKU的在库实例 |
| POST | /wms/checkOrder/check | 完成盘点（保存差异+实例明细） |

### 6.7 库存管理

| 模块 | 方法 | URL | 说明 |
|------|------|-----|------|
| 库存 | GET | /wms/inventory/list | 分页查询库存列表 |
| 库存 | GET | /wms/inventory/{id} | 查询库存详情 |
| 库存详情 | GET | /wms/inventoryDetail/list | 分页查询库存详情 |
| 库存详情 | GET | /wms/inventoryDetail/listNoPage | 查询库存详情（不分页） |
| 库存详情 | POST | /wms/inventoryDetail/export | 导出库存详情 |
| 库存流水 | GET | /wms/inventoryHistory/list | 分页查询库存流水 |

### 6.8 器材实例 `/wms/itemInstance`

| 方法 | URL | 说明 |
|------|-----|------|
| GET | /wms/itemInstance/list | 分页查询器材实例列表 |
| GET | /wms/itemInstance/listNoPage | 查询器材实例列表（不分页） |
| GET | /wms/itemInstance/{id} | 查询器材实例详情 |
| GET | /wms/itemInstance/code/{instanceCode} | 按编码查询器材实例 |
| POST | /wms/itemInstance | 新增器材实例 |
| PUT | /wms/itemInstance | 修改器材实例 |
| PUT | /wms/itemInstance/status | 更新器材实例状态 |
| PUT | /wms/itemInstance/location | 更新器材实例位置 |
| DELETE | /wms/itemInstance/{id} | 删除器材实例 |

### 6.9 箱体管理 `/wms/box`

| 方法 | URL | 说明 |
|------|-----|------|
| GET | /wms/box/list | 分页查询箱体列表 |
| GET | /wms/box/listNoPage | 查询箱体列表（不分页） |
| GET | /wms/box/{id} | 查询箱体详情 |
| GET | /wms/box/code/{boxCode} | 按箱码查询箱体 |
| POST | /wms/box | 新增箱体 |
| PUT | /wms/box | 修改箱体 |
| POST | /wms/box/pack | 装箱操作 |
| POST | /wms/box/unpack | 拆箱操作 |
| DELETE | /wms/box/{id} | 删除箱体 |

### 6.10 借还管理 `/wms/borrowRecord`

| 方法 | URL | 说明 |
|------|-----|------|
| GET | /wms/borrowRecord/list | 分页查询借还记录列表 |
| GET | /wms/borrowRecord/listNoPage | 查询借还记录列表（不分页） |
| GET | /wms/borrowRecord/{id} | 查询借还记录详情 |
| GET | /wms/borrowRecord/current/{itemInstanceId} | 查询器材当前借用记录 |
| GET | /wms/borrowRecord/warning/stats | 借还超期预警统计 |
| POST | /wms/borrowRecord/borrow | 执行借出操作 |
| POST | /wms/borrowRecord/return | 执行归还操作 |

### 6.11 其他接口

| 模块 | URL前缀 | 说明 |
|------|---------|------|
| 库区管理 | /wms/area | CRUD |
| 货架管理 | /wms/rack | CRUD |
| 货位管理 | /wms/location | CRUD |
| 器材分类 | /wms/itemCategory | 树形CRUD |
| 器材规格 | /wms/itemSku | CRUD |
| 往来单位 | /wms/merchant | CRUD |
| 入库明细 | /wms/receiptOrderDetail | CRUD |
| 出库明细 | /wms/shipmentOrderDetail | CRUD |
| 调拨明细 | /wms/movementOrderDetail | CRUD |
| 仓储布局 | /wms/storageLayout | 布局可视化查询 |

---

## 七、部署配置说明

### 7.1 环境要求

| 组件 | 版本要求 |
|------|----------|
| JDK | 17+ |
| Node.js | 16+ |
| MySQL | 8.0+ |
| Redis | 6.0+ |
| Maven | 3.8+ |
| npm | 8+ |

### 7.2 后端配置

**主配置文件**：`application.yml`

| 配置项 | 值 | 说明 |
|--------|-----|------|
| server.port | 8080 | 后端服务端口 |
| server.servlet.context-path | / | 应用访问路径 |
| mybatis-plus.id-type | ASSIGN_ID | 主键雪花算法 |
| sa-token.token-name | Authorization | Token名称 |
| sa-token.timeout | 86400 | Token有效期（秒） |
| sa-token.is-share | false | 不共用Token |
| sa-token.jwt-secret-key | abcdefghijklmnopqrstuvwxyz | JWT密钥 |

**开发环境配置**：`application-dev.yml`

| 配置项 | 值 |
|--------|-----|
| 数据库URL | jdbc:mysql://localhost:3306/wms_advence_master |
| 数据库用户名 | root |
| 数据库密码 | Test@123 |
| Redis地址 | localhost:6379 |
| Redis数据库 | 0 |
| P6Spy | true（开发环境启用SQL分析） |

**Maven Profile**：
- `local` - 本地环境
- `dev` - 开发环境（默认激活）
- `prod` - 生产环境

### 7.3 前端配置

**Vite 开发配置**：

| 配置项 | 值 | 说明 |
|--------|-----|------|
| server.port | 80 | 前端开发服务器端口 |
| server.host | true | 允许外部访问 |
| server.open | true | 自动打开浏览器 |
| proxy /dev-api | http://localhost:8080 | API代理到后端 |

**环境变量**：

| 变量 | 开发环境 | 生产环境 |
|------|----------|----------|
| VITE_APP_BASE_API | /dev-api | /prod-api |
| VITE_APP_CONTEXT_PATH | / | / |
| VITE_BUILD_COMPRESS | - | gzip |

---

## 八、项目运行环境要求和启动步骤

### 8.1 环境准备

1. 安装 JDK 17+
2. 安装 Node.js 16+
3. 安装 MySQL 8.0+，创建数据库 `wms_advence_master`
4. 安装 Redis 6.0+

### 8.2 数据库初始化

```bash
# 导入SQL脚本
mysql -u root -p wms_advence_master < script/sql/wms_advence_master.sql
```

### 8.3 后端启动

```bash
# 进入后端项目目录
cd /path/to/wms-ruoyi-advance

# 编译打包（跳过测试）
mvn clean package -DskipTests

# 运行
java -jar ruoyi-admin-wms/target/ruoyi-admin-wms.jar

# 或直接通过IDE运行 RuoYiApplication.java
```

后端启动后访问：`http://localhost:8080`

### 8.4 前端启动

```bash
# 进入前端项目目录
cd /path/to/RuoYi-WMS-VUE-advance

# 安装依赖
npm install --registry=https://registry.npmmirror.com

# 启动开发服务器
npm run dev

# 构建生产包
npm run build:prod
```

前端启动后访问：`http://localhost:80`

### 8.5 默认账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | admin123 | 超级管理员 |

---

## 九、关键代码实现逻辑解析

### 9.1 一物一码实现

**核心思路**：每个器材实例（ItemInstance）拥有唯一编码，贯穿入库→在库→出库/借还全生命周期。

**编码生成**：
- 编码格式：`{仓库前缀}ITEM{序列号}`，如 `WH1ITEM1000000001`
- 序列号通过 `wms_item_qr_code_serial` 表自增管理，默认从 `1000000001` 开始
- 批量打印二维码时调用 `/wms/item/batchPrintQrCode` 接口，自动生成指定数量的器材实例

**状态机**：

```
待入库 → 在库 → 出库
          ↓        ↑
        借出 → 归还入库(在库)
          ↓
        盘亏
          ↓
        报废出库
```

### 9.2 库存双层架构

项目采用**库存汇总 + 库存详情**双层架构：

- **wms_inventory（库存汇总）**：按 `(warehouse_id, area_id, rack_id, location_id, sku_id)` 唯一键聚合，记录当前库存数量
- **wms_inventory_detail（库存详情）**：记录每笔入库的明细，支持先进先出出库，通过 `remain_quantity` 追踪剩余数量

**出库逻辑**：出库时通过 `inventory_detail_id` 关联到具体入库批次，扣减 `remain_quantity`，实现精确的批次追溯。

### 9.3 库存流水全量记录

所有库存变动操作（入库、出库、移库、盘库、借用、归还、调整）都会写入 `wms_inventory_history`，记录：
- 变化前后数量（before_quantity / after_quantity）
- 业务动作类型（operation_type）
- 操作人（operator_name）
- 关联单据（order_id / order_no / order_type）

### 9.4 仓储布局可视化

前端提供 `wms/basic/layout/index.vue` 页面，后端通过 `StorageLayoutQueryService` 提供树形仓储结构数据，包含：
- 仓库 → 库区 → 货架 → 货位 的层级结构
- 货位网格可视化（RackGridVo / RackGridCellVo）
- 货位占用状态实时展示

### 9.5 货位自动规划

`RackLocationPlannerService` 提供货架货位自动创建能力：
- 根据货架的行数和列数自动生成货位
- 货位编码格式：`{rack_code}-R{行号}-C{列号}`
- 自动计算货位尺寸（继承货架尺寸的均分）

### 9.6 货位健康检查与重建

`LocationService` 提供两个维护性接口：
- **健康检查**（healthCheck）：验证货位占用标志与实际库存数据的一致性
- **重建**（rebuild）：修复不一致的货位占用状态

### 9.7 装箱/拆箱操作

`BoxService` 提供：
- **装箱（pack）**：将器材实例放入箱体，更新实例的 `box_id`、箱体的 `item_count` 和 `box_status`
- **拆箱（unpack）**：将器材实例从箱体取出，清除 `box_id`、更新计数和状态
- **整箱出库**：出库时指定箱体，所有箱内实例同步出库

### 9.8 借还超期预警

- 每条借还记录包含 `return_deadline`（归还期限）和 `overdue_flag`（超期标志）
- `GET /wms/borrowRecord/warning/stats` 返回超期预警统计数据（BorrowWarningStatsVo）
- 借出时记录完整的位置快照（original_warehouse_id/area_id/rack_id/location_id/box_id）
- 归还时记录新位置（returned_*），支持归还到不同位置

### 9.9 动态权限路由

前端通过 `permission.js` 实现：
1. 登录后获取用户信息
2. 根据角色获取菜单权限列表
3. 将后端菜单数据转换为 Vue Router 路由
4. 动态注册路由并渲染侧边栏菜单
5. 使用 `v-hasPermi` 指令控制按钮级权限

### 9.10 打印功能

- 集成 `vue-plugin-hiprint` 打印插件
- 支持 `PrintTemplate` 自定义打印模板组件
- `wssPrintClient.js` 提供 WebSocket 打印客户端连接
- 器材二维码批量打印：调用后端生成二维码图片，前端通过打印模板输出

---

## 十、项目特色功能和技术亮点总结

### 10.1 业务特色

1. **一物一码体系**：每个器材实例拥有唯一编码，支持从入库到出库/报废的全生命周期追踪，实现精确到单品级别的库存管理

2. **军事物流调拨**：调拨单支持通装/专装分类，包含调拨依据、调拨目的、通知机关、收物单位、发站/到站等军事物流专属字段，支持空运/公路/铁路/水运四种运输方式

3. **多级仓储布局**：仓库→库区→货架→货位四级空间管理，支持货位网格可视化展示、自动创建、占用状态管理

4. **箱体管理**：支持装箱/拆箱/整箱出库操作，箱体与器材实例一对多关系，实现批量作业效率

5. **借还超期管理**：完整的器材借用流程，包含借用审批、超期预警、归还位置追踪

6. **先进先出出库**：库存详情记录入库批次，出库时关联具体入库记录，支持先进先出策略

### 10.2 技术亮点

1. **Spring Boot 3 + Java 17**：基于最新的 Spring Boot 3 生态，利用 Java 17 新特性

2. **Sa-Token JWT 认证**：替代传统 Spring Security，更轻量级的权限认证方案，支持多端并发、动态 Token 有效期

3. **MyBatis-Plus + MapStruct-Plus**：ORM 层使用 MyBatis-Plus 简化 CRUD，MapStruct-Plus 自动生成 Entity↔Vo↔Bo 转换代码，编译期安全

4. **Redisson 分布式锁**：基于 Lock4j + Redisson 实现分布式锁，防止库存操作并发冲突

5. **动态数据源**：集成 Dynamic-DS，支持多数据源切换（master/slave）

6. **P6Spy SQL分析**：开发环境自动记录完整 SQL 及执行时间，便于性能优化

7. **SpringDoc API文档**：自动生成 OpenAPI 3.0 接口文档，支持在线调试

8. **Undertow 服务器**：替代 Tomcat，更轻量高性能的 Web 服务器

9. **雪花算法主键**：全局唯一 ID 生成，避免数据库自增 ID 在分布式环境下的问题

10. **vue-plugin-hiprint 打印**：集成 hiprint 打印插件，支持自定义打印模板，兼容 WebSocket 打印客户端

11. **多级缓存**：Redis 缓存字典数据、系统配置等热点数据，Redisson 提供分布式对象和集合操作

12. **XSS防护**：全局 XSS 过滤器，防止跨站脚本攻击

13. **数据脱敏**：ruoyi-common-sensitive 模块支持敏感数据自动脱敏

14. **幂等性控制**：ruoyi-common-idempotent 模块提供接口幂等性保障

15. **限流控制**：ruoyi-common-ratelimiter 基于 Redis 实现接口限流

---

> **文档结束** — 本文档基于项目源码和数据库脚本自动分析生成，覆盖了项目架构、前后端结构、数据库设计、业务流程、API接口、部署配置、核心逻辑和技术亮点等全部方面。
