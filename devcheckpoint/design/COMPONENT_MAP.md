# DevCheckpoint Page & Component Map

## Global

```text
AppShell
├── Sidebar
│   ├── Brand
│   ├── SidebarNav
│   ├── ContextPromoCard
│   └── UserProfile
├── Topbar
│   ├── GlobalSearch
│   ├── ShortcutHint
│   ├── ThemeButton
│   ├── Notifications
│   └── UserMenu
└── PageOutlet
```

---

## Dashboard

```text
DashboardPage
├── PageHeader
├── StatGrid
│   └── StatCard × 4
├── CurrentTaskCard
├── ProjectContextCard
├── RecentCheckpoints
│   └── CheckpointRow
├── RecentProjects
│   └── ProjectRow
└── BottomCTA
```

---

## Add Project

```text
AddProjectPage
├── PageHeader
├── StepIndicator
├── RepositorySourceTabs
├── LocalRepositoryPicker
├── GitValidationStatus
├── RecentRepositories
└── SupportedFeatures
```

---

## Project Workspace

```text
ProjectPage
├── ProjectHeader
├── TabNav
├── GitStatCards
├── ChangedFilesPanel
│   ├── FileList
│   └── CodeDiff
├── RecentCommits
└── RightRail
    ├── ActiveTaskCard
    ├── TaskNotes
    └── QuickActions
```

---

## Start Task

```text
StartTaskPage
├── TaskBasicsSection
├── ProjectEnvironmentSection
├── AdditionalContextSection
├── TaskFormActions
└── HelpRail
```

---

## Task Detail

```text
TaskDetailPage
├── TaskHeader
├── TaskTabs
├── TaskDescription
├── CurrentIssue
├── ProposedCodeChanges
├── ImplementationNotes
└── RightRail
    ├── TaskProgress
    ├── Subtasks
    ├── RecentActivity
    └── CommentBox
```

---

## Code Changes

```text
TaskCodePage
├── TaskHeader
├── FileList
├── CodeDiff
├── RelatedTasks
└── RightRail
    ├── AIAssistantPanel
    └── TaskChecklist
```

---

## Discussion

```text
TaskDiscussionPage
├── TaskHeader
├── CommentComposer
├── DiscussionTimeline
│   └── CommentItem
└── RightRail
    ├── TaskDetails
    ├── Description
    ├── Subtasks
    └── RelatedTasks
```

---

## Save Checkpoint

```text
SaveCheckpointPage
├── PageHeader
├── StepIndicator
├── ProjectContext
├── ChangedFilesPanel
├── DeveloperNotes
└── RightRail
    ├── AISummaryPreview
    └── IncludedContextList
```

---

## Checkpoints

```text
CheckpointsPage
├── PageHeader
├── CheckpointFilters
├── CheckpointList
│   └── CheckpointRow
└── CheckpointDetailsPanel
    ├── TaskSection
    ├── ChangesSection
    ├── BlockerSection
    ├── AttemptsSection
    ├── NextStepSection
    ├── ImportantFiles
    └── CheckpointActions
```

---

## Checkpoint Detail

```text
CheckpointDetailPage
├── CheckpointHeader
├── CheckpointTabs
├── ChangedFilesPanel
├── CodeDiff
├── CheckpointNotes
└── RightRail
    ├── CheckpointSummary
    ├── TaskProjectMetadata
    └── QuickActions
```

---

## Resume Development

```text
ResumeTaskPage
├── ResumeHeader
├── LastCheckpointCard
├── WhatYouWereDoing
├── BlockerCard
├── AttemptList
├── RelatedResources
├── RecentActivity
└── RightRail
    ├── QuickActions
    ├── ImportantFiles
    └── NextStepCard
```

---

## Handoffs

```text
HandoffsPage
├── PageHeader
├── HandoffTabs
├── HandoffList
│   └── HandoffRow
└── HandoffDetails
    ├── Metadata
    ├── Description
    ├── QuickStats
    ├── Tags
    └── Actions
```

---

## Create Handoff

```text
CreateHandoffPage
├── PageHeader
├── StepIndicator
├── CheckpointPicker
├── HandoffDetailsForm
├── SharingOptions
└── RightRail
    ├── HandoffPreview
    ├── AISummary
    ├── IncludedContext
    └── InstructionsPreview
```

---

## Analytics

```text
AnalyticsPage
├── DateRange
├── MetricCards
├── ProgressChart
├── TaskDistribution
├── TopProjects
├── ActivityHeatmap
└── RecentActivity
```

---

## Settings

```text
SettingsPage
├── SettingsTabs
├── GeneralSettings
├── AISettings
├── IntegrationSettings
├── LocalModelSettings
├── DataSettings
└── AdvancedSettings
```
