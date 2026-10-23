import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  H1,
  H2,
  H3,
  Stack,
  Text,
  computeDAGLayout,
  useHostTheme,
  type CanvasHostTheme,
} from "cursor/canvas";

type FlowNode = { id: string; title: string; sub?: string };

function Flow({
  nodes,
  edges,
  direction,
  theme,
  nodeWidth = 200,
  nodeHeight = 56,
}: {
  nodes: FlowNode[];
  edges: Array<{ from: string; to: string }>;
  direction: "vertical" | "horizontal";
  theme: CanvasHostTheme;
  nodeWidth?: number;
  nodeHeight?: number;
}) {
  const layout = computeDAGLayout({
    nodes: nodes.map((n) => ({ id: n.id })),
    edges,
    direction,
    nodeWidth,
    nodeHeight,
    rankGap: 48,
    nodeGap: 28,
    padding: 12,
  });
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="img"
      aria-label="Схема процесса обновления"
    >
      {layout.edges.map((e, i) => (
        <line
          key={i}
          x1={e.sourceX}
          y1={e.sourceY}
          x2={e.targetX}
          y2={e.targetY}
          stroke={e.isBackEdge ? theme.stroke.secondary : theme.accent.primary}
          strokeWidth={1.5}
          strokeDasharray={e.isBackEdge ? "5 4" : undefined}
        />
      ))}
      {layout.nodes.map((n) => {
        const meta = byId[n.id];
        return (
          <g key={n.id}>
            <rect
              x={n.x}
              y={n.y}
              width={nodeWidth}
              height={nodeHeight}
              rx={6}
              fill={theme.fill.secondary}
              stroke={theme.stroke.primary}
            />
            <text
              x={n.x + nodeWidth / 2}
              y={meta.sub ? n.y + 22 : n.y + nodeHeight / 2 + 4}
              textAnchor="middle"
              fill={theme.text.primary}
              fontSize={12}
              fontWeight={590}
            >
              {meta.title}
            </text>
            {meta.sub ? (
              <text
                x={n.x + nodeWidth / 2}
                y={n.y + 40}
                textAnchor="middle"
                fill={theme.text.secondary}
                fontSize={10}
              >
                {meta.sub}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export default function UpdateProcessViz() {
  const theme = useHostTheme();

  return (
    <Stack gap={22}>
      <Stack gap={6}>
        <H1>Автообновление типовой базы на поддержке</H1>
        <Text tone="secondary">
          Скрипт C:\temp\update_1c_universal.ps1 на 192.168.80.15. Конфигурация
          остаётся на поддержке: только CFU поставщика, без снятия с поддержки и
          без загрузки .cf.
        </Text>
      </Stack>

      <Callout tone="info">
        Запуск: Cursor на ПК → SMB + PsExec -s -i 2 → 1cv8 на 80.15 → кластер
        servsql. Один сеанс на эту ИБ. Чужие 1cv8 не трогаем. Регзадания
        блокируются только на время конфигуратора.
      </Callout>

      <H2>Контур</H2>
      <Flow
        theme={theme}
        direction="horizontal"
        nodeWidth={168}
        nodeHeight={52}
        nodes={[
          { id: "pc", title: "Cursor / ПК", sub: "скрипт, ИТС" },
          { id: "host", title: "192.168.80.15", sub: "1cv8, шаблоны" },
          { id: "cl", title: "servsql", sub: "кластер / ИБ" },
          { id: "its", title: "releases.1c.ru", sub: "updsetup.zip" },
        ]}
        edges={[
          { from: "pc", to: "host" },
          { from: "host", to: "cl" },
          { from: "pc", to: "its" },
          { from: "its", to: "host" },
        ]}
      />

      <H2>Сквозной процесс</H2>
      <Flow
        theme={theme}
        direction="vertical"
        nodeWidth={240}
        nodeHeight={58}
        nodes={[
          { id: "in", title: "Вход", sub: "Srvr, Ref, пользователь" },
          { id: "id", title: "COM: кто мы", sub: "Метаданные.Имя / Версия" },
          { id: "plan", title: "Цепочка CFU", sub: "каталог → последний релиз" },
          { id: "loop", title: "Цикл по релизам", sub: "см. схему ниже" },
          { id: "fin", title: "COM: финальная версия", sub: "сверка с целью" },
          { id: "out", title: "Финиш", sub: "закрыть 1С этой ИБ" },
        ]}
        edges={[
          { from: "in", to: "id" },
          { from: "id", to: "plan" },
          { from: "plan", to: "loop" },
          { from: "loop", to: "fin" },
          { from: "fin", to: "out" },
        ]}
      />

      <H2>Один релиз на поддержке</H2>
      <Text tone="secondary" size="small">
        Пунктир — повтор при ошибке расширения EF_*. Блокировка регзаданий
        снимается до предприятия, иначе отложенные обработчики не идут.
      </Text>
      <Flow
        theme={theme}
        direction="vertical"
        nodeWidth={250}
        nodeHeight={60}
        nodes={[
          { id: "cfu", title: "Шаблон CFU", sub: "zip → setup /s → tmplts" },
          { id: "lock", title: "Регзадания = запрет", sub: "COM кластера" },
          { id: "cfg", title: "Конфигуратор", sub: "/UpdateCfg + /UpdateDBCfg" },
          { id: "unlock", title: "Регзадания = разрешить", sub: "для отложенных" },
          { id: "legal", title: "Легальность", sub: "COM, без кликов по форме" },
          { id: "ent", title: "Предприятие", sub: "/C ЗапуститьОбновлениеИБ" },
          { id: "wait", title: "Ждать COM", sub: "не закрывать по idle" },
          { id: "ok", title: "Шаг OK", sub: "закрыть только эту ИБ" },
          { id: "ef", title: "Ошибка EF_*", sub: "/DeleteCfg -Extension" },
        ]}
        edges={[
          { from: "cfu", to: "lock" },
          { from: "lock", to: "cfg" },
          { from: "cfg", to: "unlock" },
          { from: "unlock", to: "legal" },
          { from: "legal", to: "ent" },
          { from: "ent", to: "wait" },
          { from: "wait", to: "ok" },
          { from: "wait", to: "ef" },
          { from: "ef", to: "ent" },
        ]}
      />

      <H3>Как понимаем «обновление закончено»</H3>
      <Stack gap={8}>
        <Text>
          Конфигуратор: в /Out есть «успешно завершено» — тогда закрываем
          DESIGNER.
        </Text>
        <Text>
          Предприятие: не по простою CPU. COM
          ОбновлениеИнформационнойБазы.НеобходимоОбновлениеИнформационнойБазы
          = ложь и ОтложенноеОбновлениеЗавершено = истина. Иначе окно не
          трогаем (как форма «Обновление версии приложения»).
        </Text>
      </Stack>

      <Card>
        <CardHeader>Почему это именно «на поддержке»</CardHeader>
        <CardBody>
          <Stack gap={8}>
            <Text>
              Источник — дистрибутив обновления поставщика (1cv8.cfu), не полная
              выгрузка .cf. Цепочка берётся из 1cv8upd.htm: CFU ставят только с
              разрешённых предыдущих релизов.
            </Text>
            <Text>
              Запуск: DESIGNER /UpdateCfg"path\1cv8.cfu" /UpdateDBCfg -Server —
              штатный режим обновления конфигурации на поддержке. Снятие с
              поддержки и объединение с файлом не используется.
            </Text>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
