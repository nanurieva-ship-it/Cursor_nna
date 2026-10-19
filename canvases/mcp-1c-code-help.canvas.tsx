import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  Pill,
  Row,
  Spacer,
  Stack,
  Stat,
  Table,
  Text,
  useCanvasState,
} from "cursor/canvas";

const SLIDES = [
  "title",
  "why",
  "sees",
  "limits",
  "vs",
  "fallback",
] as const;

export default function Mcp1cCodeHelpPresentation() {
  const [i, setI] = useCanvasState("slide", 0);
  const n = SLIDES.length;
  const id = SLIDES[Math.min(Math.max(i, 0), n - 1)];

  return (
    <Stack gap={20} style={{ padding: 24, maxWidth: 860 }}>
      <Row gap={8}>
        <Text tone="tertiary" size="small">
          MCP и код 1С · слайд {Math.min(i, n - 1) + 1} / {n}
        </Text>
        <Spacer />
        <Button
          variant="ghost"
          disabled={i <= 0}
          onClick={() => setI((v) => Math.max(0, v - 1))}
        >
          Назад
        </Button>
        <Button
          variant="primary"
          disabled={i >= n - 1}
          onClick={() => setI((v) => Math.min(n - 1, v + 1))}
        >
          Дальше
        </Button>
      </Row>
      <Divider />
      {id === "title" && <SlideTitle />}
      {id === "why" && <SlideWhy />}
      {id === "sees" && <SlideSees />}
      {id === "limits" && <SlideLimits />}
      {id === "vs" && <SlideVs />}
      {id === "fallback" && <SlideFallback />}
    </Stack>
  );
}

function SlideTitle() {
  return (
    <Stack gap={12}>
      <Pill active>1С + Cursor</Pill>
      <H1>Помощь с кодом 1С: MCP, не OData</H1>
      <Text tone="secondary">
        Если база уже подключена через MCP:RSV Data — это лучший канал, чтобы
        писать модули под вашу конфигурацию, а не «типовой БП из учебника».
      </Text>
      <Grid columns={3} gap={12}>
        <Stat value="MCP" label="чтение метаданных и данных" />
        <Stat value=".bsl" label="код — файл на диск" />
        <Stat value="OData" label="для Excel и обменов" />
      </Grid>
    </Stack>
  );
}

function SlideWhy() {
  return (
    <Stack gap={12}>
      <H2>Зачем MCP для кода</H2>
      <Text>
        Агент видит живую базу: имена объектов, реквизиты, табличные части,
        синонимы и примеры строк. Процедуры получаются под ваши объекты.
      </Text>
      <Callout tone="info" title="Пример из работы">
        Документ.ФУ_ЗаявкаНаОплату, ТЧ ГрафикПлатежей — поля ДатаПлатежа,
        СуммаКОплате, Статус. Не абстрактная «заявка УТ», а то, что в ДЕПО.
      </Callout>
    </Stack>
  );
}

function SlideSees() {
  return (
    <Stack gap={12}>
      <H2>Что агент берёт из MCP</H2>
      <Table
        headers={["Инструмент", "Зачем для кода"]}
        rows={[
          ["config", "Конфигурация, версия, расширения"],
          ["describe / get_structure", "Объекты, ТЧ, типы, перечисления"],
          ["query / execute_query", "Живые строки, язык запросов 1С"],
          ["reveal", "Расшифровка ФИО и контрагентов человеку"],
        ]}
      />
      <Text tone="secondary" size="small">
        Источник: MCP:RSV Data · только чтение
      </Text>
    </Stack>
  );
}

function SlideLimits() {
  return (
    <Stack gap={12}>
      <H2>Чего MCP не делает</H2>
      <Grid columns={2} gap={12}>
        <Card>
          <CardHeader>Читает</CardHeader>
          <CardBody>
            <Text>Метаданные, справочники, документы, регистры, остатки.</Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Не пишет в 1С</CardHeader>
          <CardBody>
            <Text>
              Не вставляет модуль в конфигуратор, не проводит документ, не
              проверяет компиляцию в дизайнере.
            </Text>
          </CardBody>
        </Card>
      </Grid>
      <Text>
        Результат — текст `.bsl`. Его копируете в объект вы.
      </Text>
    </Stack>
  );
}

function SlideVs() {
  return (
    <Stack gap={12}>
      <H2>MCP или OData</H2>
      <Table
        headers={["Задача", "MCP:RSV Data", "OData"]}
        rows={[
          ["Найти объект по синониму", "describe find=Заявка", "EDMX, Document_…"],
          ["Структура ТЧ", "get_structure", "угадывание навигации"],
          ["Запрос 1С", "ВЫБРАТЬ, соединения, срезы", "$filter / $expand"],
          ["Написать модуль", "удобнее", "обычно хуже"],
          ["Excel, сайт, CRUD", "не для этого", "да"],
        ]}
        rowTone={["info", "info", "info", "success", undefined]}
      />
    </Stack>
  );
}

function SlideFallback() {
  return (
    <Stack gap={12}>
      <H2>Если MCP к базе нет</H2>
      <Text>
        Код всё равно можно писать по выгрузке конфигурации, скринам формы или
        описанию. Просто больше угадывания имён.
      </Text>
      <Callout tone="success" title="Правило выбора">
        База подключена через MCP — пишем код через него. Нужна выгрузка в Excel
        или обмен с внешней системой — OData. Нет ни того ни другого — файлы и
        скрины.
      </Callout>
    </Stack>
  );
}
