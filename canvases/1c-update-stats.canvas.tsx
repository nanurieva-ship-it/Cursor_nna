import {
  BarChart,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Grid,
  H1,
  H2,
  Stack,
  Stat,
  Table,
  Text,
} from "cursor/canvas";

const bases = [
  {
    ib: "servsql\\test_ben2",
    product: "Бухгалтерия 3.0",
    from: "3.0.202.14",
    to: "3.0.205.17",
    when: "27.08.2026",
    stepsOk: 1,
    note: "Обработчики после удаления EF_188",
  },
  {
    ib: "servsql\\agashin_zup_copy (ЗУП)",
    product: "ЗУП 3.1",
    from: "3.1.38.18",
    to: "3.1.38.92",
    when: "14.09.2026",
    stepsOk: 2,
    note: "38.18→38.69, затем 38.69→38.92",
  },
  {
    ib: "servsql\\agashin_zup_copy (БП)",
    product: "Бухгалтерия 3.0",
    from: "3.0.195.40",
    to: "3.0.206.19",
    when: "14.09.2026",
    stepsOk: 4,
    note: "После загрузки другой базы в тот же Ref",
  },
];

const stepDurations = [
  { label: "БП 196.21", minutes: 10 },
  { label: "БП 200.23", minutes: 21 },
  { label: "БП 205.17", minutes: 23 },
  { label: "БП 206.19", minutes: 15 },
];

export default function UpdateStats() {
  return (
    <Stack gap={20}>
      <Stack gap={6}>
        <H1>Статистика автообновления 1С</H1>
        <Text tone="secondary" size="small">
          Источник: C:\temp\update_1c_*.log на 192.168.80.15 · 27.08–14.09.2026
        </Text>
      </Stack>

      <Grid columns={4} gap={12}>
        <Stat value="3" label="Успешных доведения до актуала" />
        <Stat value="7" label="Шагов CFU+обработчики OK" tone="success" />
        <Stat value="3.1.38.92" label="Последний ЗУП на тесте" />
        <Stat value="3.0.206.19" label="Последняя БП на тесте" />
      </Grid>

      <Callout tone="info">
        Ref agashin_zup_copy использовался дважды: сначала ЗУП, затем в него
        загрузили Бухгалтерию 3.0.195.40. Итоговые версии относятся к разным
        выгрузкам в одном имени базы.
      </Callout>

      <Card>
        <CardHeader>Итоговые базы</CardHeader>
        <CardBody>
          <Table
            headers={["База", "Конфигурация", "Было", "Стало", "Дата", "Шаги", "Примечание"]}
            rows={bases.map((b) => [
              b.ib,
              b.product,
              b.from,
              b.to,
              b.when,
              String(b.stepsOk),
              b.note,
            ])}
            rowTone={bases.map(() => "success" as const)}
          />
        </CardBody>
      </Card>

      <Grid columns={2} gap={16}>
        <Card>
          <CardHeader>Длительность шагов БП 14.09 (минуты)</CardHeader>
          <CardBody>
            <BarChart
              categories={stepDurations.map((s) => s.label)}
              series={[{ name: "Минуты", data: stepDurations.map((s) => s.minutes) }]}
              height={220}
            />
            <Text tone="secondary" size="small">
              Старт 11:39:55 → DONE 12:50:50 · всего 71 мин · обработчики на каждом шаге exit=0
            </Text>
          </CardBody>
        </Card>

        <Stack gap={12}>
          <H2>Прогоны скрипта</H2>
          <Text>
            Лог-файлов update_1c_*.log: 12. Успешный финал с DONE: 2 (ЗУП 3.1.38.92 и БП 3.0.206.19). Остальное — черновые запуски, COM-identity, сбой CFU «нет доступных обновлений», исключительная блокировка из‑за фоновых заданий.
          </Text>
          <Text>
            ЗУП 38.92: 10:12–10:21 (9 мин). БП test_ben2: 27.08, 3.0.202.14→3.0.205.17. autodrive_uat_copy (ЗУП 3.1.34.107) до актуала в этой серии не доводили.
          </Text>
          <Text tone="secondary" size="small">
            Платформа 8.3.27.2214 · хост обновления 192.168.80.15 · кластер servsql
          </Text>
        </Stack>
      </Grid>
    </Stack>
  );
}
