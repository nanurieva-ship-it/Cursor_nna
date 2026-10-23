import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  Stack,
  Table,
  Text,
} from "cursor/canvas";

export default function Update1cFor1cDevs() {
  return (
    <Stack gap={18} style={{ padding: 24, maxWidth: 900 }}>
      <H1>Автообновление типовой на поддержке</H1>
      <Text tone="secondary">
        Контур агента Cursor: не MCP и не OData. CFU → DESIGNER /UpdateCfg +
        /UpdateDBCfg -Server → ENTERPRISE, обработчики ИБ. Оркестратор
        update_1c_universal.ps1 на 192.168.80.15, ИБ на servsql.
      </Text>

      <Grid columns={2} gap={12}>
        <Card>
          <CardHeader>Агент не делает</CardHeader>
          <CardBody>
            <Text>
              Не правит cf/cfe в EDT, не ходит в ИБ через MCP, не жмёт UI
              легальности, не гоняет параллельные 1cv8 по одной базе.
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Агент делает</CardHeader>
          <CardBody>
            <Text>
              Cmdline DESIGNER/ENTERPRISE, COM к ИБ и кластеру (регзадания),
              ожидание функций БСП, kill только процессов этой ИБ (Srvr+Ref).
            </Text>
          </CardBody>
        </Card>
      </Grid>

      <H2>Поток прогона</H2>
      <Table
        headers={["Шаг", "Механика"]}
        rows={[
          ["Вход", "Srvr, Ref, пользователь. Платформа 8.3.27.2214"],
          ["Идентификация", "COM Метаданные.Имя/Версия. DumpConfigToFiles не используем"],
          ["Цепочка CFU", "1cv8upd.htm from-versions до последнего в каталоге"],
          ["Цикл", "На каждый CFU: DESIGNER, затем ENTERPRISE"],
          ["Контроль", "COM финальная Версия. Stop-ThisIB по cmdline"],
        ]}
      />

      <H2>Один шаг CFU</H2>
      <Text>
        ScheduledJobsDenied True → DESIGNER /UpdateCfg + /UpdateDBCfg -Server
        (ProcessStartInfo, иначе /UpdateCfg теряется) → Denied False → COM
        ЗаписатьПодтверждениеЛегальностиПолученияОбновлений → ENTERPRISE /C
        ЗапуститьОбновлениеИнформационнойБазы → ждать НЕ НеобходимоОбновлениеИБ
        и ОтложенноеОбновлениеЗавершено → закрыть 1cv8 этой ИБ.
      </Text>
      <Callout tone="warning" title="Idle процесса ≠ успех">
        Полоска «Обновление версии приложения» ещё идёт. Kill по простою давал
        обрыв на 6%. Легальность UI под SYSTEM/PsExec не работает.
      </Callout>

      <H2>Факт БП 14.09.2026, agashin_zup_copy</H2>
      <Table
        headers={["CFU", "Интервал", "Мин", "Замечание"]}
        rows={[
          ["3.0.196.21", "11:41–11:51", "10", ""],
          ["3.0.200.23", "11:51–12:12", "21", ""],
          ["3.0.205.17", "12:12–12:35", "23", "EF_188 → DeleteCfg, повтор"],
          ["3.0.206.19", "12:35–12:50", "15", "последний Accounting30"],
          ["Итого скрипта", "", "71", "отложенные догонялись после"],
        ]}
      />
      <Text size="small" tone="secondary">
        Прямой 195.40→205.17: «файл не содержит доступных обновлений». ЗУП
        38.69→92: один hop, 9 мин.
      </Text>

      <H2>Что ломало прогон</H2>
      <Table
        headers={["Симптом", "Фикс"]}
        rows={[
          ["UpdateCfg не в cmdline", "ProcessStartInfo.Arguments одной строкой"],
          ["Не узнали конфиг", "COM InvokeMember, не DumpConfigToFiles"],
          ["Exclusive lock ФЗ", "Denied только вокруг UpdateCfg"],
          ["Обработчики не идут", "снять Denied до ENTERPRISE"],
          ["Чужие окна 1С", "Srvr+Ref, в т.ч. /S с слэшем"],
          ["Кириллица в ps1", "U() char-codes, файл ASCII"],
        ]}
      />

      <Divider />
      <Text size="small" tone="secondary">
        MCP user-rsv-data — другой контур (чтение данных). Пакеты D:\Обновления,
        tmplts C:\zup_tmplts / C:\bp_tmplts.
      </Text>
    </Stack>
  );
}
