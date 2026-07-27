
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.system_nodes (
  id text PRIMARY KEY,
  name text NOT NULL,
  layer text NOT NULL,
  status text NOT NULL DEFAULT 'Unknown',
  optional boolean NOT NULL DEFAULT false,
  summary text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  owns text[] NOT NULL DEFAULT '{}',
  does_not_own text[] NOT NULL DEFAULT '{}',
  location text NOT NULL DEFAULT '',
  risks text[] NOT NULL DEFAULT '{}',
  x numeric NOT NULL DEFAULT 50,
  y numeric NOT NULL DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.system_nodes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_nodes TO authenticated;
GRANT ALL ON public.system_nodes TO service_role;
ALTER TABLE public.system_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read system nodes" ON public.system_nodes FOR SELECT USING (true);
CREATE POLICY "Admins manage system nodes" ON public.system_nodes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.system_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id text NOT NULL,
  to_id text NOT NULL,
  label text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'data',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.system_edges TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.system_edges TO authenticated;
GRANT ALL ON public.system_edges TO service_role;
ALTER TABLE public.system_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read system edges" ON public.system_edges FOR SELECT USING (true);
CREATE POLICY "Admins manage system edges" ON public.system_edges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.registry_projects (
  id text PRIMARY KEY,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'Unknown',
  maturity text NOT NULL DEFAULT 'Unknown',
  purpose text NOT NULL DEFAULT '',
  dependencies text[] NOT NULL DEFAULT '{}',
  repo text NOT NULL DEFAULT 'Unknown',
  repo_known boolean NOT NULL DEFAULT false,
  next_action text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.registry_projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registry_projects TO authenticated;
GRANT ALL ON public.registry_projects TO service_role;
ALTER TABLE public.registry_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read projects" ON public.registry_projects FOR SELECT USING (true);
CREATE POLICY "Admins manage projects" ON public.registry_projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.workflows (
  id text PRIMARY KEY,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'Unknown',
  trigger text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  systems text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.workflows TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflows TO authenticated;
GRANT ALL ON public.workflows TO service_role;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read workflows" ON public.workflows FOR SELECT USING (true);
CREATE POLICY "Admins manage workflows" ON public.workflows FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.tools (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  status text NOT NULL DEFAULT 'Unknown',
  used_for text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tools TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tools TO authenticated;
GRANT ALL ON public.tools TO service_role;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read tools" ON public.tools FOR SELECT USING (true);
CREATE POLICY "Admins manage tools" ON public.tools FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER update_system_nodes_updated_at BEFORE UPDATE ON public.system_nodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_edges_updated_at BEFORE UPDATE ON public.system_edges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_registry_projects_updated_at BEFORE UPDATE ON public.registry_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON public.tools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.system_nodes (id,name,layer,status,optional,summary,role,owns,does_not_own,location,risks,x,y) VALUES
('local-host','Local Windows Host','Local','Active',false,'Primary workstation running local agents, CLIs and dev servers.','Execution surface for local agents, file system and long-running dev processes.',ARRAY['Local agent runtimes','Dev servers','Local file vault mount'],ARRAY['Public ingress','Shared team state'],'Windows 11 + WSL',ARRAY['Single point of failure','Availability tied to machine uptime'],12,22),
('cloudflare','Cloudflare','Edge','Active',false,'Edge network: DNS, Tunnel, Access, Workers.','Public entry point and edge compute in front of local and cloud services.',ARRAY['DNS','Tunnel ingress','Edge routing','Workers runtime'],ARRAY['Business logic','Long-term storage'],'Cloudflare account (managed)',ARRAY['Config drift between Tunnel and Access rules'],50,8),
('mcp-gateway','MCP Gateway','Gateway','Active',false,'Single aggregation point for MCP servers and tool exposure.','Normalises MCP tool access for every agent client; the only sanctioned tool router.',ARRAY['MCP server registry','Tool namespacing','Client fan-out'],ARRAY['Model selection','Agent memory'],'Local host, exposed via Cloudflare Tunnel',ARRAY['Duplicate gateways spun up per-conversation','Unversioned tool names'],50,30),
('hermes','Hermes','Agent','Active',false,'Orchestration and messaging layer between Edgar and agents.','Routes intent to the right agent/tool and keeps a conversational trace.',ARRAY['Agent routing','Conversation trace','Task dispatch'],ARRAY['Tool implementations','Knowledge storage'],'Local host service',ARRAY['Overlaps with MCP Gateway if scope is not held'],24,52),
('openclaw','OpenClaw','Agent','Experimental',false,'Autonomous execution agent sandbox.','Runs longer autonomous jobs against a constrained toolset.',ARRAY['Autonomous run loop','Sandboxed execution'],ARRAY['Production writes','Credential storage'],'Local host sandbox',ARRAY['Unbounded runs','Unclear promotion path to Formal'],48,56),
('agent-kb','Agent-KB','Knowledge','Planning',false,'Structured knowledge base agents read from and write to.','Canonical machine-readable memory: decisions, entities, conventions.',ARRAY['Structured records','Retrieval index'],ARRAY['Human note-taking UX','Runtime secrets'],'To be decided (candidate: local store + sync)',ARRAY['Divergence from Obsidian notes','No agreed schema yet'],74,52),
('obsidian','Obsidian','Knowledge','Active',false,'Human-first note vault, daily notes and long-form thinking.','Where Edgar thinks. Source of raw material for Agent-KB.',ARRAY['Daily notes','Long-form docs','Inbox capture'],ARRAY['Agent-readable schema','Task execution'],'Local vault on Windows host',ARRAY['Becomes an unstructured dumping ground'],88,30),
('automation','Automation (n8n)','Automation','Planning',false,'Scheduled and event-driven workflow automation.','Glue for recurring jobs: syncs, digests, webhooks.',ARRAY['Cron jobs','Webhook handlers','Cross-tool syncs'],ARRAY['Agent reasoning','Source of truth data'],'Self-hosted n8n (planned)',ARRAY['Hidden business logic buried in flows'],74,76),
('auth','EDGAR Auth','Identity','Planning',false,'Single identity and access model across EDGAR-OS surfaces.','One login story for dashboards, gateways and internal tools.',ARRAY['Identity','Session','Access policy'],ARRAY['App-level permissions logic','Secrets vault'],'Design phase — no implementation in v0.1',ARRAY['Per-app ad-hoc auth accumulating'],26,8),
('github','GitHub','Source','Active',false,'Canonical code storage and change history.','Every Formal project must have exactly one canonical repository here.',ARRAY['Source of truth for code','PR review trail'],ARRAY['Runtime state','Planning source of truth'],'github.com/<edgar-org>',ARRAY['Orphan repos created from one-off chats'],12,78),
('cloud-vps','Cloud / VPS','Optional','Unknown',true,'Optional always-on compute for services that outgrow the local host.','Fallback/uplift target when uptime matters more than locality.',ARRAY['Always-on runtime (if adopted)'],ARRAY['Anything today — not adopted in v0.1'],'Not provisioned',ARRAY['Premature adoption duplicates local services'],50,88);

INSERT INTO public.system_edges (from_id,to_id,label,kind) VALUES
('auth','cloudflare','policy','control'),
('cloudflare','mcp-gateway','tunnel','data'),
('local-host','mcp-gateway','hosts','control'),
('mcp-gateway','hermes','tools','data'),
('mcp-gateway','openclaw','tools','data'),
('mcp-gateway','agent-kb','read/write','data'),
('obsidian','agent-kb','source material','data'),
('agent-kb','automation','sync jobs','data'),
('hermes','github','changes','data'),
('local-host','obsidian','vault','data'),
('automation','cloud-vps','if adopted','optional'),
('cloudflare','cloud-vps','if adopted','optional');

INSERT INTO public.registry_projects (id,name,status,maturity,purpose,dependencies,repo,repo_known,next_action,notes) VALUES
('hermes','Hermes','Active','Formal','Agent orchestration and messaging layer for EDGAR-OS.',ARRAY['MCP Gateway','Local Windows Host'],'github.com/<edgar-org>/hermes',true,'Freeze the routing contract so MCP Gateway scope stops leaking in.','Most mature runtime piece. Keep it thin: routing, not tools.'),
('edgar-auth','EDGAR Auth','Planning','Formal','One identity and access model for every EDGAR-OS surface.',ARRAY['Cloudflare Access','MCP Gateway'],'Not yet created',false,'Write a one-page decision: Cloudflare Access vs self-hosted IdP.','Explicitly out of scope for Control Center v0.1.'),
('mcp-gateway','MCP Gateway','Active','Formal','Single aggregation point for all MCP servers and tools.',ARRAY['Local Windows Host','Cloudflare Tunnel'],'github.com/<edgar-org>/mcp-gateway',true,'Publish the tool namespace registry and deprecate ad-hoc endpoints.','Highest duplication risk in the whole landscape.'),
('agent-kb','Agent-KB','Planning','Formal','Structured, agent-readable knowledge base and decision log.',ARRAY['Obsidian','MCP Gateway'],'Unknown',false,'Draft the entity schema (Decision, Entity, Convention, Source).','Blocked on schema agreement, not on tooling.'),
('big','BIG','Unknown','Unknown','Scope not yet recorded in the registry — needs a definition pass.',ARRAY['Unknown'],'Unknown',false,'Define it in one sentence or move it to the Inbox.','Placeholder kept visible on purpose: unknowns must be seen, not hidden.'),
('control-center','Control Center','Active','Formal','See the whole EDGAR-OS landscape in 30 seconds; prevent duplicate architectures.',ARRAY['None (local-only in v0.1)'],'This repository',true,'Use it daily for one week before adding any backend.','v0.1 is local-first: no auth, no database, no live checks.'),
('ai-gateway-observability','AI Gateway Observability','Experimental','Experiment','Usage, cost and latency visibility across model calls.',ARRAY['Cloudflare','MCP Gateway'],'Unknown',false,'Decide whether this is a page in Control Center or a separate service.','Candidate for absorption instead of a standalone project.'),
('cloudflare-feature-sprint','Cloudflare Feature Sprint','Paused','Experiment','Timeboxed exploration of Workers, Tunnel and Access capabilities.',ARRAY['Cloudflare'],'Unknown',false,'Resume only after EDGAR Auth direction is decided.','Paused deliberately to avoid parallel edge architectures.');

INSERT INTO public.workflows (id,name,status,trigger,summary,systems) VALUES
('wf-daily-review','Daily landscape review','Active','Manual, each morning','Open Control Center, scan status chips, move at most three roadmap items.',ARRAY['Control Center']),
('wf-proposal','Chat proposal → review → merge','Planning','When a conversation proposes a new system or project','Capture in Inbox, review against the map, then promote or reject.',ARRAY['Control Center','Agent-KB']),
('wf-vault-sync','Obsidian → Agent-KB sync','Planning','Scheduled (planned)','Extract structured records from notes into the knowledge base.',ARRAY['Obsidian','Agent-KB','Automation (n8n)']),
('wf-tunnel-health','Tunnel & gateway sanity check','Unknown','Manual','Manually verify tunnel + gateway reachability. Not automated in v0.1.',ARRAY['Cloudflare','MCP Gateway']);

INSERT INTO public.tools (id,name,category,status,used_for) VALUES
('t-claude-code','Claude Code','Coding agent','Active','Repo-level implementation work'),
('t-codex','Codex','Coding agent','Active','Execution handoffs from planning'),
('t-n8n','n8n','Automation','Planning','Scheduled syncs and webhooks'),
('t-linear','Linear','Tracking','Experimental','Issue tracking for Formal projects'),
('t-notion','Notion','Docs','Paused','Shared documents; overlaps with Obsidian'),
('t-cf-tunnel','Cloudflare Tunnel','Networking','Active','Exposing local services safely');
