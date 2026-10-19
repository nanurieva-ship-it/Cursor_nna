import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  computeDAGLayout,
  useHostTheme,
} from "cursor/canvas";

const FLOW_NODES = [
  { id: "user" },
  { id: "agent" },
  { id: "mcp" },
  { id: "http" },
  { id: "ib" },
  { id: "bsl" },
];

const FLOW_EDGES = [
  { from: "user", to: "agent" },
  { from: "agent", to: "mcp" },
  { from: "mcp", to: "http" },
  { from: "http", to: "ib" },
  { from: "agent", to: "bsl" },
];

const NODE_LABEL: Record<string, { title: string; sub: string; tone: "accent" | "neutral" | "ok" }> = {
  user: { title: "Вы в чате", sub: "«заполни график в заявке»", tone: "neutral" },
  agent: { title: "Агент Cursor", sub: "Grok · инструменты", tone: "accent" },
  mcp: { title: "MCP:RSV Data", sub: "config / describe / query", tone: "accent" },
  http: { title: "HTTP-сервис расширения", sub: "RSVData в информационной базе", tone: "neutral" },
  ib: { title: "1С: база", sub: "чтение метаданных и данных", tone: "ok" },
  bsl: { title: "Файл .bsl", sub: "код пишется локально, не в базу", tone: "ok" },
};

export default function McpVsOdataCanvas() {
  const theme = useHostTheme();
  const layout = computeDAGLayout({
    nodes: FLOW_NODES,
    edges: FLOW_EDGES,
    direction: "horizontal",
    nodeWidth: 168,
    nodeHeight: 72,
    rankGap: 36,
    nodeGap: 28,
    padding: 8,
  });

  return (
    <Stack gap={24} style={{ padding: 24, maxWidth: 980 }}>
      <Stack gap={8}>
        <H1>Как я подключаюсь к 1С и пишу код</H1>
        <Text tone="secondary">
          Да: через MCP (MCP:RSV Data). Это не OData и не COM. MCP только читает базу;
          код модулей я записываю в файл у вас на диске.
        </Text>
      </Stack>

      <Grid columns={3} gap={12}>
        <Stat value="MCP" label="Канал к 1С" />
        <Stat value="Только чтение" label="config, query, структура" />
        <Stat value="Локальный .bsl" label="Запись в конфигуратор — вручную" />
      </Grid>

      <Stack gap={8}>
        <H2>Цепочка вызовов</H2>
        <Text tone="secondary" size="small">
          Слева направо. Ветка вниз от агента — запись кода, она не идёт в HTTP 1С.
        </Text>
        <div
          style={{
            position: "relative",
            width: layout.width,
            height: layout.height,
            maxWidth: "100%",
          }}
        >
          <svg
            width={layout.width}
            height={layout.height}
            style={{ position: "absolute", inset: 0 }}
          >
            {layout.edges.map((e) => (
              <line
                key={`${e.from}-${e.to}`}
                x1={e.sourceX}
                y1={e.sourceY}
                x2={e.targetX}
                y2={e.targetY}
                stroke={theme.stroke.primary}
                strokeWidth={1.5}
              />
            ))}
          </svg>
          {layout.nodes.map((n) => {
            const meta = NODE_LABEL[n.id];
            const isAccent = meta.tone === "accent";
            const isOk = meta.tone === "ok";
            return (
              <div
                key={n.id}
                style={{
                  position: "absolute",
                  left: n.x,
                  top: n.y,
                  width: 168,
                  height: 72,
                  boxSizing: "border-box",
                  padding: "8px 10px",
                  background: isAccent
                    ? theme.fill.tertiary
                    : isOk
                      ? theme.bg.elevated
                      : theme.bg.chrome,
                  border: `1px solid ${isAccent ? theme.accent.primary : theme.stroke.secondary}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <Text size="small" weight="semibold">
                  {meta.title}
                </Text>
                <Text size="small" tone="secondary">
                  {meta.sub}
                </Text>
              </div>
            );
          })}
        </div>
      </Stack>

      <Callout tone="info" title="Что именно умеет MCP в этой базе">
        Расширение RSVData 1.3.0 уже стоит в ИБ «Аренда и управление недвижимостью».
        Инструменты: config, describe, get_structure, query, execute_query (язык запросов 1С),
        reveal. Запись документов, проведение и правка модулей конфигурации — недоступны.
      </Callout>

      <H2>Почему не OData</H2>
      <Table
        headers={["Задача агента", "MCP:RSV Data", "OData /odata/standard.odata"]}
        rows={[
          [
            "Узнать, что за конфигурация",
            "Один вызов config: имя, версия, расширения, подсистемы",
            "Нет паспорта. Нужно знать публикацию и копать $metadata",
          ],
          [
            "Найти объект «заявка»",
            "describe find=Заявка — все категории и синонимы",
            "Гигантский EDMX. Имена вида Document_ФУ_ЗаявкаНаОплату",
          ],
          [
            "Структура ТЧ ГрафикПлатежей",
            "get_structure: поля, типы, значения перечислений",
            "$metadata + угадывание NavigationProperty / *N",
          ],
          [
            "Выборка с группировкой",
            "Нативный ВЫБРАТЬ … СГРУППИРОВАТЬ ПО",
            "$filter / $expand. Нет виртуальных таблиц регистров как в 1С",
          ],
          [
            "Персональные данные",
            "Анонимизация + reveal в ответе человеку",
            "Сырые ФИО и контрагенты в JSON, если сервис открыт",
          ],
          [
            "Запись кода в конфигурацию",
            "Не пишет. Файл .bsl на диск",
            "Тоже не пишет модули. Только CRUD опубликованных сущностей",
          ],
        ]}
        rowTone={["info", undefined, "info", undefined, undefined, "success"]}
      />

      <Grid columns={2} gap={16}>
        <Card>
          <CardHeader trailing={<Pill tone="success" active>Использую</Pill>}>
            MCP
          </CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>
                Канал уже настроен в Cursor (user-rsv-data). Расширение в базе активно.
                Агент вызывает инструменты по схеме, без ручной сборки URL.
              </Text>
              <Text tone="secondary" size="small">
                Пример: describe → Документ.ФУ_ЗаявкаНаОплату → get_structure → query по
                ГрафикПлатежей → текст процедур на языке 1С.
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader trailing={<Pill>Не для этой задачи</Pill>}>
            OData
          </CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>
                Стандартная публикация HTTP-сервиса 1С для внешних систем: Excel, Power BI,
                обмен с сайтом. Нужны публикация IIS/Apache, пользователь, права, CORS.
              </Text>
              <Text tone="secondary" size="small">
                Для интеграций — нормальный выбор. Для разбора метаданных и запросов 1С
                агенту он неудобнее и обычно шире открыт, чем нужно.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <Divider />

      <H3>Что я не делаю через MCP</H3>
      <Row gap={8}>
        <Pill tone="deleted">Не провожу документы</Pill>
        <Pill tone="deleted">Не пишу модули в ИБ</Pill>
        <Pill tone="deleted">Не меняю конфигурацию</Pill>
      </Row>
      <Text tone="secondary" size="small">
        После генерации код нужно вставить в конфигураторе: модуль объекта
        Документ.ФУ_ЗаявкаНаОплату и команды формы.
      </Text>
      <Text tone="tertiary" size="small">
        Источник схемы: сессия агента · MCP user-rsv-data · 15.09.2026
      </Text>
    </Stack>
  );
}
