<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type {
  Comment,
  DiscoverAuditRecord,
  DiscoverAnalytics,
  DiscoverReportCase,
  DiscoverTag,
  DiscoverUserGovernanceDetail,
  DiscoverUserGovernanceSummary,
  Post
} from "@community-map/shared";

import { adminApi } from "@/api/client";
import { confirmPermanentPostDeletion } from "./post-permanent-delete";

type QueueTab =
  | "posts"
  | "comments"
  | "reports"
  | "users"
  | "audit"
  | "ops"
  | "analytics";
type DrawerKind = "post" | "comment" | "report" | "user" | "audit";

const activeTab = ref<QueueTab>("posts");
const loading = ref(false);
const actioning = ref(false);
const drawerVisible = ref(false);
const drawerKind = ref<DrawerKind>("post");
const selectedPost = ref<Post | null>(null);
const selectedComment = ref<Comment | null>(null);
const selectedReport = ref<DiscoverReportCase | null>(null);
const selectedUser = ref<DiscoverUserGovernanceDetail | null>(null);
const selectedAudit = ref<DiscoverAuditRecord | null>(null);

const posts = ref<Post[]>([]);
const comments = ref<Comment[]>([]);
const reports = ref<DiscoverReportCase[]>([]);
const users = ref<DiscoverUserGovernanceSummary[]>([]);
const auditRecords = ref<DiscoverAuditRecord[]>([]);
const tags = ref<DiscoverTag[]>([]);
const analytics = ref<DiscoverAnalytics | null>(null);
const selectedPosts = ref<Post[]>([]);
const selectedComments = ref<Comment[]>([]);

const postFilters = reactive({
  keyword: "",
  status: "all",
  language: "",
  tag: ""
});
const commentFilters = reactive({
  keyword: "",
  status: "all"
});
const reportFilters = reactive({
  status: "all",
  targetType: "",
  reason: ""
});
const userFilters = reactive({
  keyword: "",
  status: "all"
});
const auditFilters = reactive({
  targetType: "",
  targetId: ""
});
const tagForm = reactive({
  id: "",
  label_zh: "",
  label_en: "",
  status: "active" as "active" | "hidden"
});
const analyticsFilters = reactive({
  windowDays: 30
});

const statusOptions = [
  { label: "全部", value: "all" },
  { label: "可见", value: "visible" },
  { label: "已举报", value: "reported" },
  { label: "已隐藏", value: "hidden" },
  { label: "已删除", value: "deleted" }
];

const reportStatusOptions = [
  { label: "全部", value: "all" },
  { label: "待处理", value: "open" },
  { label: "已处置", value: "actioned" },
  { label: "已驳回", value: "rejected" }
];

const userStatusOptions = [
  { label: "全部", value: "all" },
  { label: "正常", value: "active" },
  { label: "警告", value: "warned" },
  { label: "禁言", value: "muted" },
  { label: "封禁", value: "banned" },
  { label: "停用", value: "inactive" }
];

const targetTypeOptions = [
  { label: "全部", value: "" },
  { label: "帖子", value: "post" },
  { label: "评论", value: "comment" }
];

const activeCount = computed(() => {
  const countByTab: Record<QueueTab, number> = {
    posts: posts.value.length,
    comments: comments.value.length,
    reports: reports.value.length,
    users: users.value.length,
    audit: auditRecords.value.length,
    ops: tags.value.length,
    analytics: analytics.value?.pending_workload_count ?? 0
  };
  return countByTab[activeTab.value];
});

const reportCountForTarget = (targetType: "post" | "comment", id: string) =>
  reports.value.filter(
    (report) => report.target_type === targetType && report.target_id === id
  ).length;

const auditForTarget = (targetType: string, id: string) =>
  auditRecords.value.filter(
    (record) => record.target_type === targetType && record.target_id === id
  );

const compactDate = (value?: string | null) =>
  value ? value.replace("T", " ").slice(0, 16) : "-";

const statusTagType = (status: string) => {
  if (status === "visible" || status === "active") {
    return "success";
  }
  if (status === "reported" || status === "open" || status === "warned") {
    return "warning";
  }
  if (status === "hidden" || status === "muted") {
    return "info";
  }
  return "danger";
};

const loadPosts = async () => {
  const result = await adminApi.admin.listDiscoverPosts({
    keyword: postFilters.keyword || undefined,
    status: postFilters.status,
    language: postFilters.language
      ? (postFilters.language as "zh" | "en")
      : undefined,
    tag: postFilters.tag || undefined
  });
  posts.value = result.data.items;
};

const loadComments = async () => {
  const result = await adminApi.admin.listDiscoverComments({
    keyword: commentFilters.keyword || undefined,
    status: commentFilters.status
  });
  comments.value = result.data.items;
};

const loadReports = async () => {
  const result = await adminApi.admin.listDiscoverReports({
    status: reportFilters.status,
    targetType: reportFilters.targetType
      ? (reportFilters.targetType as "post" | "comment")
      : undefined,
    reason: reportFilters.reason || undefined
  });
  reports.value = result.data.items;
};

const loadUsers = async () => {
  const result = await adminApi.admin.listDiscoverUsers({
    keyword: userFilters.keyword || undefined,
    status: userFilters.status
  });
  users.value = result.data.items;
};

const loadAudit = async () => {
  const result = await adminApi.admin.listDiscoverAudit({
    targetType: auditFilters.targetType
      ? (auditFilters.targetType as
          | "post"
          | "comment"
          | "report"
          | "user"
          | "tag")
      : undefined,
    targetId: auditFilters.targetId || undefined
  });
  auditRecords.value = result.data.items;
};

const loadTags = async () => {
  const result = await adminApi.admin.listDiscoverTags();
  tags.value = result.data.items;
};

const loadAnalytics = async () => {
  const result = await adminApi.admin.discoverAnalytics({
    windowDays: analyticsFilters.windowDays
  });
  analytics.value = result.data;
};

const loadActive = async () => {
  loading.value = true;
  try {
    if (activeTab.value === "posts") {
      await Promise.all([loadPosts(), loadReports(), loadAudit()]);
    } else if (activeTab.value === "comments") {
      await Promise.all([loadComments(), loadReports(), loadAudit()]);
    } else if (activeTab.value === "reports") {
      await Promise.all([loadReports(), loadAudit()]);
    } else if (activeTab.value === "users") {
      await Promise.all([loadUsers(), loadAudit()]);
    } else if (activeTab.value === "ops") {
      await Promise.all([loadPosts(), loadTags(), loadAudit()]);
    } else if (activeTab.value === "analytics") {
      await loadAnalytics();
    } else {
      await loadAudit();
    }
  } finally {
    loading.value = false;
  }
};

const refreshAll = async () => {
  loading.value = true;
  try {
    await Promise.all([
      loadPosts(),
      loadComments(),
      loadReports(),
      loadUsers(),
      loadTags(),
      loadAnalytics(),
      loadAudit()
    ]);
  } finally {
    loading.value = false;
  }
};

const openPost = async (post: Post) => {
  selectedPost.value = post;
  selectedComment.value = null;
  selectedReport.value = null;
  selectedUser.value = null;
  selectedAudit.value = null;
  drawerKind.value = "post";
  drawerVisible.value = true;
  if (!comments.value.length) {
    await loadComments();
  }
};

const openComment = (comment: Comment) => {
  selectedPost.value = null;
  selectedComment.value = comment;
  selectedReport.value = null;
  selectedUser.value = null;
  selectedAudit.value = null;
  drawerKind.value = "comment";
  drawerVisible.value = true;
};

const openReport = async (report: DiscoverReportCase) => {
  const detail = await adminApi.admin.detailDiscoverReport(report._id);
  selectedPost.value = null;
  selectedComment.value = null;
  selectedReport.value = detail.data;
  selectedUser.value = null;
  selectedAudit.value = null;
  drawerKind.value = "report";
  drawerVisible.value = true;
};

const openUser = async (row: DiscoverUserGovernanceSummary) => {
  const detail = await adminApi.admin.detailDiscoverUser(row.user._id);
  selectedPost.value = null;
  selectedComment.value = null;
  selectedReport.value = null;
  selectedUser.value = detail.data;
  selectedAudit.value = null;
  drawerKind.value = "user";
  drawerVisible.value = true;
};

const openAudit = (record: DiscoverAuditRecord) => {
  selectedPost.value = null;
  selectedComment.value = null;
  selectedReport.value = null;
  selectedUser.value = null;
  selectedAudit.value = record;
  drawerKind.value = "audit";
  drawerVisible.value = true;
};

const moderatePost = async (
  post: Post,
  reviewStatus: Post["review_status"]
) => {
  actioning.value = true;
  try {
    await adminApi.admin.moderatePost(post._id, {
      review_status: reviewStatus,
      reason: `Admin set post ${reviewStatus}`
    });
    ElMessage.success("帖子状态已更新");
    await refreshAll();
  } finally {
    actioning.value = false;
  }
};

const permanentlyDeletePost = async (post: Post) => {
  try {
    const decision = await confirmPermanentPostDeletion(
      post,
      (target) =>
        ElMessageBox.confirm(
          `将永久删除帖子“${target.title}”（${target._id}）及其评论、互动、举报、通知和媒体文件。此操作不可恢复。`,
          "确认永久删除帖子",
          {
            confirmButtonText: "永久删除",
            cancelButtonText: "取消",
            type: "error"
          }
        ),
      async (postId) => {
        actioning.value = true;
        return adminApi.admin.permanentlyDeletePost(postId);
      }
    );
    if (decision.status === "cancelled") {
      return;
    }

    const deleted = decision.result.data.deleted;
    ElMessage.success(
      `已永久删除：评论 ${deleted.comments}、互动 ${deleted.interactions}、举报 ${deleted.reports}、媒体 ${deleted.storage_objects}`
    );
    if (selectedPost.value?._id === post._id) {
      selectedPost.value = null;
      drawerVisible.value = false;
    }
    selectedPosts.value = [];
    await refreshAll();
  } catch (error) {
    ElMessage.error(
      error instanceof Error ? error.message : "永久删除帖子失败"
    );
  } finally {
    actioning.value = false;
  }
};

const updatePostOps = async (
  post: Post,
  patch: Partial<
    Pick<
      Post,
      | "is_pinned"
      | "is_featured"
      | "is_recommended"
      | "is_official"
      | "ops_rank"
    >
  >
) => {
  actioning.value = true;
  try {
    await adminApi.admin.updateDiscoverPostOps(post._id, {
      ...patch,
      reason: "Admin updated discover ops metadata"
    });
    ElMessage.success("运营位已更新");
    await refreshAll();
  } finally {
    actioning.value = false;
  }
};

const saveTag = async () => {
  if (!tagForm.id || !tagForm.label_zh || !tagForm.label_en) {
    ElMessage.warning("请填写标签 ID、中英文名称");
    return;
  }

  actioning.value = true;
  try {
    await adminApi.admin.upsertDiscoverTag(tagForm.id, {
      label_zh: tagForm.label_zh,
      label_en: tagForm.label_en,
      status: tagForm.status
    });
    ElMessage.success("标签已保存");
    tagForm.id = "";
    tagForm.label_zh = "";
    tagForm.label_en = "";
    tagForm.status = "active";
    await Promise.all([loadTags(), loadAudit()]);
  } finally {
    actioning.value = false;
  }
};

const toggleTagStatus = async (tag: DiscoverTag) => {
  actioning.value = true;
  try {
    await adminApi.admin.upsertDiscoverTag(tag._id, {
      label_zh: tag.label_zh,
      label_en: tag.label_en,
      status: tag.status === "active" ? "hidden" : "active"
    });
    ElMessage.success("标签状态已更新");
    await Promise.all([loadTags(), loadAudit()]);
  } finally {
    actioning.value = false;
  }
};

const moderateComment = async (comment: Comment, status: Comment["status"]) => {
  actioning.value = true;
  try {
    await adminApi.admin.moderateComment(comment._id, {
      status,
      reason: `Admin set comment ${status}`
    });
    ElMessage.success("评论状态已更新");
    await refreshAll();
  } finally {
    actioning.value = false;
  }
};

const resolveReport = async (
  report: DiscoverReportCase,
  status: "actioned" | "rejected",
  moderationAction: "none" | "hide" | "restore" | "delete" = "none"
) => {
  actioning.value = true;
  try {
    await adminApi.admin.resolveDiscoverReport(report._id, {
      status,
      moderation_action: moderationAction,
      reason:
        status === "actioned"
          ? `Report ${report._id} actioned`
          : `Report ${report._id} rejected`
    });
    ElMessage.success("举报处理已保存");
    await refreshAll();
    if (selectedReport.value?._id === report._id) {
      const detail = await adminApi.admin.detailDiscoverReport(report._id);
      selectedReport.value = detail.data;
    }
  } finally {
    actioning.value = false;
  }
};

const enforceUser = async (
  row: DiscoverUserGovernanceSummary | DiscoverUserGovernanceDetail,
  status: "active" | "warned" | "muted" | "banned"
) => {
  actioning.value = true;
  const userId = row.user._id;
  try {
    const result = await adminApi.admin.enforceDiscoverUser(userId, {
      status,
      reason: `Admin set user ${status}`
    });
    ElMessage.success("用户治理状态已更新");
    await refreshAll();
    if (selectedUser.value?.user._id === userId) {
      selectedUser.value = result.data;
    }
  } finally {
    actioning.value = false;
  }
};

const batchModeratePosts = async (reviewStatus: Post["review_status"]) => {
  actioning.value = true;
  try {
    await Promise.all(
      selectedPosts.value.map((post) =>
        adminApi.admin.moderatePost(post._id, {
          review_status: reviewStatus,
          reason: `Batch set post ${reviewStatus}`
        })
      )
    );
    ElMessage.success("批量帖子操作已完成");
    selectedPosts.value = [];
    await refreshAll();
  } finally {
    actioning.value = false;
  }
};

const batchModerateComments = async (status: Comment["status"]) => {
  actioning.value = true;
  try {
    await Promise.all(
      selectedComments.value.map((comment) =>
        adminApi.admin.moderateComment(comment._id, {
          status,
          reason: `Batch set comment ${status}`
        })
      )
    );
    ElMessage.success("批量评论操作已完成");
    selectedComments.value = [];
    await refreshAll();
  } finally {
    actioning.value = false;
  }
};

onMounted(refreshAll);
</script>

<template>
  <div class="page-card governance-page">
    <div class="page-header">
      <div>
        <h2>Discover 治理台</h2>
        <div class="header-meta">当前队列 {{ activeCount }} 条</div>
      </div>
      <el-button :loading="loading" type="primary" @click="refreshAll">
        刷新
      </el-button>
    </div>

    <el-tabs v-model="activeTab" @tab-change="loadActive">
      <el-tab-pane label="帖子" name="posts">
        <div class="toolbar">
          <el-input
            v-model="postFilters.keyword"
            clearable
            placeholder="标题或正文"
            @keyup.enter="loadActive"
          />
          <el-select v-model="postFilters.status">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-select
            v-model="postFilters.language"
            clearable
            placeholder="语言"
          >
            <el-option label="中文" value="zh" />
            <el-option label="English" value="en" />
          </el-select>
          <el-input
            v-model="postFilters.tag"
            clearable
            placeholder="标签"
            @keyup.enter="loadActive"
          />
          <el-button @click="loadActive">筛选</el-button>
          <el-button
            :disabled="!selectedPosts.length"
            :loading="actioning"
            @click="batchModeratePosts('hidden')"
          >
            批量隐藏
          </el-button>
          <el-button
            :disabled="!selectedPosts.length"
            :loading="actioning"
            @click="batchModeratePosts('visible')"
          >
            批量恢复
          </el-button>
        </div>

        <el-table
          v-loading="loading"
          :data="posts"
          @selection-change="selectedPosts = $event"
        >
          <el-table-column type="selection" width="48" />
          <el-table-column prop="title" label="标题" min-width="260" />
          <el-table-column prop="author_user_id" label="作者" width="130" />
          <el-table-column prop="language" label="语言" width="80" />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.review_status)">
                {{ row.review_status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="举报" width="90">
            <template #default="{ row }">
              {{ reportCountForTarget("post", row._id) }}
            </template>
          </el-table-column>
          <el-table-column label="运营" width="180">
            <template #default="{ row }">
              <el-tag v-if="row.is_pinned" size="small" type="warning">
                置顶
              </el-tag>
              <el-tag v-if="row.is_recommended" size="small" type="primary">
                推荐
              </el-tag>
              <el-tag v-if="row.is_official" size="small" type="info">
                官方
              </el-tag>
              <span v-if="row.ops_rank">#{{ row.ops_rank }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="170">
            <template #default="{ row }">
              {{ compactDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="420" fixed="right">
            <template #default="{ row }">
              <div class="post-actions">
                <div class="post-action-row">
                  <el-button size="small" @click="openPost(row)">
                    查看
                  </el-button>
                  <el-button
                    size="small"
                    :loading="actioning"
                    @click="moderatePost(row, 'hidden')"
                  >
                    隐藏
                  </el-button>
                  <el-button
                    size="small"
                    :loading="actioning"
                    @click="moderatePost(row, 'visible')"
                  >
                    恢复
                  </el-button>
                  <el-button
                    size="small"
                    :loading="actioning"
                    @click="updatePostOps(row, { is_pinned: !row.is_pinned })"
                  >
                    {{ row.is_pinned ? "取消置顶" : "置顶" }}
                  </el-button>
                </div>
                <div class="post-action-row post-action-row-danger">
                  <el-button
                    size="small"
                    type="danger"
                    :loading="actioning"
                    @click="moderatePost(row, 'deleted')"
                  >
                    软删除
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    plain
                    :loading="actioning"
                    @click="permanentlyDeletePost(row)"
                  >
                    永久删除
                  </el-button>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="运营" name="ops">
        <div class="toolbar ops-toolbar">
          <el-input v-model="tagForm.id" placeholder="标签 ID" />
          <el-input v-model="tagForm.label_zh" placeholder="中文名" />
          <el-input v-model="tagForm.label_en" placeholder="English label" />
          <el-select v-model="tagForm.status">
            <el-option label="启用" value="active" />
            <el-option label="隐藏" value="hidden" />
          </el-select>
          <el-button :loading="actioning" type="primary" @click="saveTag">
            保存标签
          </el-button>
        </div>

        <el-table v-loading="loading" :data="posts">
          <el-table-column prop="title" label="帖子" min-width="240" />
          <el-table-column label="置顶" width="90">
            <template #default="{ row }">
              <el-switch
                :model-value="row.is_pinned"
                :loading="actioning"
                @change="(value: boolean) => updatePostOps(row, { is_pinned: value })"
              />
            </template>
          </el-table-column>
          <el-table-column label="推荐" width="90">
            <template #default="{ row }">
              <el-switch
                :model-value="row.is_recommended"
                :loading="actioning"
                @change="(value: boolean) => updatePostOps(row, { is_recommended: value })"
              />
            </template>
          </el-table-column>
          <el-table-column label="官方" width="90">
            <template #default="{ row }">
              <el-switch
                :model-value="row.is_official"
                :loading="actioning"
                @change="(value: boolean) => updatePostOps(row, { is_official: value })"
              />
            </template>
          </el-table-column>
          <el-table-column label="排序" width="150">
            <template #default="{ row }">
              <el-input-number
                :model-value="row.ops_rank"
                :min="0"
                :step="1"
                size="small"
                @change="(value: number | undefined) => updatePostOps(row, { ops_rank: value ?? 0 })"
              />
            </template>
          </el-table-column>
        </el-table>

        <h3 class="section-title">标签 taxonomy</h3>
        <el-table v-loading="loading" :data="tags">
          <el-table-column prop="_id" label="ID" width="140" />
          <el-table-column prop="label_zh" label="中文名" />
          <el-table-column prop="label_en" label="英文名" />
          <el-table-column prop="post_count" label="帖子数" width="100" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button
                size="small"
                :loading="actioning"
                @click="toggleTagStatus(row)"
              >
                {{ row.status === "active" ? "隐藏" : "启用" }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="分析" name="analytics">
        <div class="toolbar">
          <el-input-number
            v-model="analyticsFilters.windowDays"
            :min="1"
            :max="90"
            :step="1"
            controls-position="right"
          />
          <el-button :loading="loading" type="primary" @click="loadAnalytics">
            刷新分析
          </el-button>
        </div>

        <div v-if="analytics" class="analytics-grid">
          <el-card>
            <template #header>内容量</template>
            <div class="metric-row">
              <span>帖子</span><strong>{{ analytics.post_count }}</strong>
            </div>
            <div class="metric-row">
              <span>评论</span><strong>{{ analytics.comment_count }}</strong>
            </div>
            <div class="metric-row">
              <span>举报</span><strong>{{ analytics.report_count }}</strong>
            </div>
          </el-card>
          <el-card>
            <template #header>待处理</template>
            <div class="metric-row">
              <span>打开举报</span>
              <strong>{{ analytics.open_report_count }}</strong>
            </div>
            <div class="metric-row">
              <span>总工作量</span>
              <strong>{{ analytics.pending_workload_count }}</strong>
            </div>
            <div class="metric-row">
              <span>平均处理小时</span>
              <strong>{{ analytics.average_moderation_hours ?? "-" }}</strong>
            </div>
          </el-card>
          <el-card>
            <template #header>互动</template>
            <div class="metric-row">
              <span>点赞</span><strong>{{ analytics.engagement.like_count }}</strong>
            </div>
            <div class="metric-row">
              <span>收藏</span>
              <strong>{{ analytics.engagement.favorite_count }}</strong>
            </div>
            <div class="metric-row">
              <span>分享</span><strong>{{ analytics.engagement.share_count }}</strong>
            </div>
          </el-card>
          <el-card>
            <template #header>活跃作者</template>
            <div
              v-for="author in analytics.active_authors"
              :key="author.user_id"
              class="metric-row"
            >
              <span>{{ author.user_id }}</span>
              <strong>{{ author.post_count + author.comment_count }}</strong>
            </div>
          </el-card>
          <el-card>
            <template #header>热门地点</template>
            <div
              v-for="place in analytics.popular_places"
              :key="place.place_id"
              class="metric-row"
            >
              <span>{{ place.place_id }}</span>
              <strong>{{ place.post_count }}</strong>
            </div>
          </el-card>
          <el-card>
            <template #header>热门活动</template>
            <div
              v-for="event in analytics.popular_events"
              :key="event.event_id"
              class="metric-row"
            >
              <span>{{ event.event_id }}</span>
              <strong>{{ event.post_count }}</strong>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="评论" name="comments">
        <div class="toolbar">
          <el-input
            v-model="commentFilters.keyword"
            clearable
            placeholder="评论内容"
            @keyup.enter="loadActive"
          />
          <el-select v-model="commentFilters.status">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-button @click="loadActive">筛选</el-button>
          <el-button
            :disabled="!selectedComments.length"
            :loading="actioning"
            @click="batchModerateComments('hidden')"
          >
            批量隐藏
          </el-button>
          <el-button
            :disabled="!selectedComments.length"
            :loading="actioning"
            @click="batchModerateComments('visible')"
          >
            批量恢复
          </el-button>
        </div>

        <el-table
          v-loading="loading"
          :data="comments"
          @selection-change="selectedComments = $event"
        >
          <el-table-column type="selection" width="48" />
          <el-table-column prop="content" label="内容" min-width="320" />
          <el-table-column prop="post_id" label="帖子" width="130" />
          <el-table-column prop="author_user_id" label="作者" width="130" />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)">{{
                row.status
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="240" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="openComment(row)">查看</el-button>
              <el-button
                size="small"
                :loading="actioning"
                @click="moderateComment(row, 'hidden')"
              >
                隐藏
              </el-button>
              <el-button
                size="small"
                :loading="actioning"
                @click="moderateComment(row, 'visible')"
              >
                恢复
              </el-button>
              <el-button
                size="small"
                type="danger"
                :loading="actioning"
                @click="moderateComment(row, 'deleted')"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="举报" name="reports">
        <div class="toolbar">
          <el-select v-model="reportFilters.status">
            <el-option
              v-for="item in reportStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-select v-model="reportFilters.targetType">
            <el-option
              v-for="item in targetTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-input
            v-model="reportFilters.reason"
            clearable
            placeholder="原因"
            @keyup.enter="loadActive"
          />
          <el-button @click="loadActive">筛选</el-button>
        </div>

        <el-table v-loading="loading" :data="reports">
          <el-table-column prop="_id" label="Case" width="140" />
          <el-table-column prop="target_type" label="对象" width="90" />
          <el-table-column prop="target_id" label="对象 ID" width="150" />
          <el-table-column prop="reason" label="原因" min-width="160" />
          <el-table-column label="证据" width="80">
            <template #default="{ row }">{{
              row.evidence_file_ids.length
            }}</template>
          </el-table-column>
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)">{{
                row.status
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="170">
            <template #default="{ row }">
              {{ compactDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="300" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="openReport(row)">查看</el-button>
              <el-button
                size="small"
                :loading="actioning"
                @click="resolveReport(row, 'actioned', 'hide')"
              >
                处置隐藏
              </el-button>
              <el-button
                size="small"
                :loading="actioning"
                @click="resolveReport(row, 'rejected')"
              >
                驳回
              </el-button>
              <el-button
                size="small"
                type="danger"
                :loading="actioning"
                @click="resolveReport(row, 'actioned', 'delete')"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="用户" name="users">
        <div class="toolbar">
          <el-input
            v-model="userFilters.keyword"
            clearable
            placeholder="昵称、手机号或 ID"
            @keyup.enter="loadActive"
          />
          <el-select v-model="userFilters.status">
            <el-option
              v-for="item in userStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-button @click="loadActive">筛选</el-button>
        </div>

        <el-table v-loading="loading" :data="users">
          <el-table-column prop="user.nickname" label="用户" min-width="180" />
          <el-table-column prop="user._id" label="ID" width="130" />
          <el-table-column label="角色" min-width="180">
            <template #default="{ row }">
              <el-tag
                v-for="role in row.user.role_flags"
                :key="role"
                class="role-tag"
                size="small"
              >
                {{ role }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="治理" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.enforcement.status)">
                {{ row.enforcement.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="post_count" label="帖子" width="80" />
          <el-table-column prop="comment_count" label="评论" width="80" />
          <el-table-column prop="report_count" label="举报" width="80" />
          <el-table-column prop="violation_count" label="记录" width="80" />
          <el-table-column label="操作" width="300" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="openUser(row)">查看</el-button>
              <el-button
                size="small"
                :loading="actioning"
                @click="enforceUser(row, 'warned')"
              >
                警告
              </el-button>
              <el-button
                size="small"
                :loading="actioning"
                @click="enforceUser(row, 'muted')"
              >
                禁言
              </el-button>
              <el-button
                size="small"
                type="danger"
                :loading="actioning"
                @click="enforceUser(row, 'banned')"
              >
                封禁
              </el-button>
              <el-button
                size="small"
                :loading="actioning"
                @click="enforceUser(row, 'active')"
              >
                恢复
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="审计" name="audit">
        <div class="toolbar">
          <el-select v-model="auditFilters.targetType">
            <el-option
              v-for="item in targetTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
            <el-option label="举报" value="report" />
            <el-option label="用户" value="user" />
            <el-option label="标签" value="tag" />
          </el-select>
          <el-input
            v-model="auditFilters.targetId"
            clearable
            placeholder="对象 ID"
            @keyup.enter="loadActive"
          />
          <el-button @click="loadActive">筛选</el-button>
        </div>

        <el-table v-loading="loading" :data="auditRecords">
          <el-table-column prop="created_at" label="时间" width="170">
            <template #default="{ row }">
              {{ compactDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="action" label="动作" width="150" />
          <el-table-column prop="actor_user_id" label="操作人" width="130" />
          <el-table-column label="对象" width="230">
            <template #default="{ row }">
              {{ row.target_type }} / {{ row.target_id }}
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="原因" min-width="240" />
          <el-table-column label="操作" width="90" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="openAudit(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-drawer v-model="drawerVisible" size="48%" title="治理详情">
      <section v-if="drawerKind === 'post' && selectedPost" class="drawer-body">
        <h3>{{ selectedPost.title }}</h3>
        <p>{{ selectedPost.content }}</p>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="作者">
            {{ selectedPost.author_user_id }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            {{ selectedPost.review_status }}
          </el-descriptions-item>
          <el-descriptions-item label="语言">
            {{ selectedPost.language }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ compactDate(selectedPost.created_at) }}
          </el-descriptions-item>
        </el-descriptions>
        <div class="drawer-actions">
          <el-button
            type="danger"
            plain
            :loading="actioning"
            @click="permanentlyDeletePost(selectedPost)"
          >
            永久删除帖子
          </el-button>
        </div>
        <h4>评论</h4>
        <el-table
          :data="comments.filter((item) => item.post_id === selectedPost?._id)"
          size="small"
        >
          <el-table-column prop="content" label="内容" />
          <el-table-column prop="status" label="状态" width="100" />
        </el-table>
        <h4>举报</h4>
        <el-table
          :data="
            reports.filter(
              (item) =>
                item.target_type === 'post' &&
                item.target_id === selectedPost?._id
            )
          "
          size="small"
        >
          <el-table-column prop="_id" label="Case" width="140" />
          <el-table-column prop="reason" label="原因" />
          <el-table-column prop="status" label="状态" width="100" />
        </el-table>
      </section>

      <section
        v-else-if="drawerKind === 'comment' && selectedComment"
        class="drawer-body"
      >
        <h3>{{ selectedComment._id }}</h3>
        <p>{{ selectedComment.content }}</p>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="帖子">
            {{ selectedComment.post_id }}
          </el-descriptions-item>
          <el-descriptions-item label="作者">
            {{ selectedComment.author_user_id }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            {{ selectedComment.status }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ compactDate(selectedComment.created_at) }}
          </el-descriptions-item>
        </el-descriptions>
      </section>

      <section
        v-else-if="drawerKind === 'report' && selectedReport"
        class="drawer-body"
      >
        <h3>{{ selectedReport._id }}</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="对象">
            {{ selectedReport.target_type }} / {{ selectedReport.target_id }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            {{ selectedReport.status }}
          </el-descriptions-item>
          <el-descriptions-item label="举报人">
            {{ selectedReport.reporter_user_id }}
          </el-descriptions-item>
          <el-descriptions-item label="处理人">
            {{ selectedReport.handler_user_id ?? "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="原因">
            {{ selectedReport.reason }}
          </el-descriptions-item>
          <el-descriptions-item label="处理说明">
            {{ selectedReport.resolution_note ?? "-" }}
          </el-descriptions-item>
        </el-descriptions>
        <p>{{ selectedReport.description }}</p>
        <h4>证据</h4>
        <el-table :data="selectedReport.evidence" size="small">
          <el-table-column prop="file_id" label="文件" min-width="220" />
          <el-table-column prop="visibility" label="权限" width="100" />
          <el-table-column prop="temp_url" label="临时 URL" min-width="220" />
        </el-table>
        <div class="drawer-actions">
          <el-button
            :loading="actioning"
            @click="resolveReport(selectedReport, 'actioned', 'hide')"
          >
            处置隐藏
          </el-button>
          <el-button
            :loading="actioning"
            @click="resolveReport(selectedReport, 'rejected')"
          >
            驳回
          </el-button>
        </div>
      </section>

      <section
        v-else-if="drawerKind === 'user' && selectedUser"
        class="drawer-body"
      >
        <h3>{{ selectedUser.user.nickname }}</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户 ID">
            {{ selectedUser.user._id }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            {{ selectedUser.enforcement.status }}
          </el-descriptions-item>
          <el-descriptions-item label="角色">
            {{ selectedUser.user.role_flags.join(", ") }}
          </el-descriptions-item>
          <el-descriptions-item label="原因">
            {{ selectedUser.enforcement.reason ?? "-" }}
          </el-descriptions-item>
        </el-descriptions>
        <div class="drawer-actions">
          <el-button @click="enforceUser(selectedUser, 'warned')"
            >警告</el-button
          >
          <el-button @click="enforceUser(selectedUser, 'muted')"
            >禁言</el-button
          >
          <el-button type="danger" @click="enforceUser(selectedUser, 'banned')">
            封禁
          </el-button>
          <el-button @click="enforceUser(selectedUser, 'active')"
            >恢复</el-button
          >
        </div>
        <h4>帖子</h4>
        <el-table :data="selectedUser.posts" size="small">
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="review_status" label="状态" width="100" />
        </el-table>
        <h4>评论</h4>
        <el-table :data="selectedUser.comments" size="small">
          <el-table-column prop="content" label="内容" />
          <el-table-column prop="status" label="状态" width="100" />
        </el-table>
      </section>

      <section
        v-else-if="drawerKind === 'audit' && selectedAudit"
        class="drawer-body"
      >
        <h3>{{ selectedAudit.action }}</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="操作人">
            {{ selectedAudit.actor_user_id }}
          </el-descriptions-item>
          <el-descriptions-item label="对象">
            {{ selectedAudit.target_type }} / {{ selectedAudit.target_id }}
          </el-descriptions-item>
          <el-descriptions-item label="时间">
            {{ compactDate(selectedAudit.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="原因">
            {{ selectedAudit.reason ?? "-" }}
          </el-descriptions-item>
        </el-descriptions>
        <pre>{{ JSON.stringify(selectedAudit.previous_state, null, 2) }}</pre>
        <pre>{{ JSON.stringify(selectedAudit.next_state, null, 2) }}</pre>
      </section>
    </el-drawer>
  </div>
</template>

<style scoped>
.governance-page {
  min-height: calc(100vh - 96px);
}

.header-meta {
  margin-top: 6px;
  color: #6b7280;
  font-size: 13px;
}

.toolbar {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr)) repeat(3, auto);
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.role-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}

.drawer-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.drawer-body h3,
.drawer-body h4,
.drawer-body p {
  margin: 0;
}

.drawer-body p {
  color: #374151;
  line-height: 1.6;
}

.drawer-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.post-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}

.post-action-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
}

.post-action-row :deep(.el-button + .el-button) {
  margin-left: 0;
}

.post-action-row-danger {
  justify-content: flex-start;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 16px;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  color: #374151;
}

.metric-row strong {
  color: #111827;
}

pre {
  max-height: 220px;
  overflow: auto;
  margin: 0;
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  color: #111827;
}
</style>
