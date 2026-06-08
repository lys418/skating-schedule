-- =============================================
-- 링호성 쇼트트랙팀 일정 관리 - Supabase SQL
-- Supabase > SQL Editor 에서 실행하세요
-- =============================================

-- 1. 스케줄 테이블 생성
create table if not exists schedules (
  id          bigint generated always as identity primary key,
  year        int not null,
  month       int not null,   -- 0~11 (JS 기준)
  day         int not null,
  am_start    text,
  am_end      text,
  pm_ground   text,
  pm_skating  text,
  fence_set   boolean default false,
  fence_remove boolean default false,
  subway      boolean default false,
  is_rest     boolean default false,
  note        text,
  updated_at  timestamptz default now(),
  unique (year, month, day)
);

-- 2. 업데이트 시간 자동 갱신 트리거
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger schedules_updated_at
  before update on schedules
  for each row execute function update_updated_at();

-- 3. 누구나 읽기 가능, 쓰기도 허용 (팀 내부용)
alter table schedules enable row level security;

create policy "anyone can read" on schedules
  for select using (true);

create policy "anyone can insert" on schedules
  for insert with check (true);

create policy "anyone can update" on schedules
  for update using (true);

create policy "anyone can delete" on schedules
  for delete using (true);

-- 4. 2026년 6월 초기 데이터 입력
insert into schedules (year, month, day, am_start, am_end, pm_ground, pm_skating, fence_set, fence_remove, subway, is_rest, note) values
(2026,5,1,'8:30','10:00','5-7','7-9',false,false,false,false,''),
(2026,5,2,'7:00','8:30','5-7','7-9',false,false,false,false,''),
(2026,5,3,'6:00','7:30','5-7','7-8',true,false,false,false,'지방선거'),
(2026,5,4,'6:00','7:30','5-7','7-9',true,false,false,false,''),
(2026,5,5,'9:00','10:00','5-7','7-9',false,false,false,false,''),
(2026,5,6,'6:00','7:00','','',true,false,false,true,'현충일'),
(2026,5,8,'7:00','8:30','5-7','7-9',false,false,false,false,''),
(2026,5,9,'6:00','7:30','5-7','7-9',true,false,true,false,'지하'),
(2026,5,10,'8:00','9:00','','',false,false,false,false,''),
(2026,5,11,'7:00','8:30','5-7','7-9',false,false,false,false,''),
(2026,5,12,'6:00','7:30','5-7','7-9',true,false,true,false,'지하'),
(2026,5,13,'6:00','7:00','','',true,false,false,false,''),
(2026,5,15,'7:00','8:00','5-7','7-9',false,false,false,false,''),
(2026,5,16,'6:00','7:30','5-7','7-9',true,false,true,false,'지하'),
(2026,5,17,'8:30','10:00','','',false,false,false,false,''),
(2026,5,18,'7:00','8:30','5-7','7-9',false,false,false,false,''),
(2026,5,19,'6:00','8:00','5-7','7-9',true,false,true,false,'지하'),
(2026,5,20,'6:00','7:00','','',true,false,false,false,''),
(2026,5,22,'7:00','8:30','5-7','7-9',false,false,false,false,''),
(2026,5,23,'6:00','7:00','5-7','7-9',true,false,false,false,''),
(2026,5,24,'8:30','10:00','','',false,false,false,false,''),
(2026,5,25,'6:00','7:30','5-7','7-9',true,false,false,false,''),
(2026,5,26,'6:00','7:30','5-7','7-9',true,false,true,false,'지하'),
(2026,5,27,'6:00','7:00','','',true,false,false,false,''),
(2026,5,29,'7:00','8:00','5-7','7-9',false,false,false,false,''),
(2026,5,30,'6:00','7:30','5-7','7-9',true,false,true,false,'지하')
on conflict (year, month, day) do nothing;
