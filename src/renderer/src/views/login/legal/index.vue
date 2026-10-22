<template>
    <article class="legal-document">
        <nav class="legal-navigation" aria-label="协议导航">
            <router-link :to="{ name: 'Login', params: { block: 'login' }, query: $route.query }"
                >返回登录</router-link
            >
            <div class="legal-tabs">
                <router-link
                    :to="{ name: 'Login', params: { block: 'terms' }, query: $route.query }"
                    :aria-current="kind === 'terms' ? 'page' : undefined"
                    >服务条款</router-link
                >
                <router-link
                    :to="{ name: 'Login', params: { block: 'privacy' }, query: $route.query }"
                    :aria-current="kind === 'privacy' ? 'page' : undefined"
                    >隐私政策</router-link
                >
            </div>
        </nav>
        <header class="legal-heading">
            <img src="@/assets/logo.svg" alt="Fab" draggable="false" />
            <p class="legal-eyebrow">FAB · LEGAL</p>
            <h1>{{ document.title }}</h1>
            <p>{{ document.subtitle }}</p>
            <p class="legal-date">更新及生效日期：{{ operator.updatedAt }}</p>
        </header>
        <aside class="legal-summary">
            <strong>重要提示</strong>
            <p>{{ document.summary }}</p>
        </aside>
        <div class="legal-body">
            <section
                v-for="section in document.sections"
                :key="section.title"
                :class="{ important: section.important }"
            >
                <h2>{{ section.title }}</h2>
                <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
                <ul v-if="section.items">
                    <li v-for="item in section.items" :key="item">{{ item }}</li>
                </ul>
            </section>
            <section class="legal-contact">
                <h2>联系我们</h2>
                <p>
                    {{ operator.name }}<br /><a :href="'mailto:' + operator.email">{{
                        operator.email
                    }}</a>
                </p>
            </section>
            <section class="legal-references">
                <h2>相关法律法规</h2>
                <ul>
                    <li v-for="reference in references" :key="reference.url">
                        <a :href="reference.url" target="_blank" rel="noopener noreferrer">{{
                            reference.title
                        }}</a>
                    </li>
                </ul>
            </section>
        </div>
    </article>
</template>

<script>
import { legalDocuments, legalOperator, legalReferences } from './documents'

export default {
    name: 'FabLegalDocument',
    props: {
        kind: {
            type: String,
            required: true,
            validator: (value) => ['terms', 'privacy'].includes(value)
        }
    },
    computed: {
        document() {
            return legalDocuments[this.kind]
        },
        operator() {
            return legalOperator
        },
        references() {
            return legalReferences
        }
    },
    watch: {
        kind: {
            immediate: true,
            handler() {
                this.$nextTick(() => {
                    document.title = `${this.document.title} · Fab`
                    this.$el?.closest('.login-page')?.scrollTo({ top: 0 })
                })
            }
        }
    }
}
</script>

<style lang="scss">
.login-page {
    .legal-document {
        padding: 28px 44px 40px;
        border: 1px solid var(--auth-border);
        border-radius: 16px;
        background: var(--auth-card);
        box-sizing: border-box;
        color: var(--auth-text);

        a {
            color: var(--auth-link);
            text-decoration: none;
            overflow-wrap: anywhere;
            &:hover {
                text-decoration: underline;
            }
            &:focus-visible {
                outline: 2px solid #958df1;
                outline-offset: 4px;
            }
        }

        .legal-navigation {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 16px;
            font-size: 12px;
        }

        .legal-tabs {
            display: flex;
            gap: 18px;
            a[aria-current='page'] {
                font-weight: 600;
                text-decoration: underline;
                text-underline-offset: 6px;
            }
        }

        .legal-heading {
            padding: 32px 0 22px;
            text-align: center;
            img {
                width: 48px;
                height: 48px;
                object-fit: contain;
            }
            h1 {
                margin: 12px 0;
                color: var(--auth-link);
                font-size: 22px;
                font-weight: 500;
            }
            p {
                margin: 8px 0;
                color: var(--auth-muted);
                font-size: 13px;
                line-height: 1.8;
            }
            .legal-eyebrow {
                font-size: 10px;
                letter-spacing: 3px;
            }
            .legal-date {
                font-size: 12px;
            }
        }

        .legal-summary {
            padding: 16px 20px;
            border: 1px solid var(--auth-border);
            border-radius: 10px;
            background: rgba(149, 141, 241, 0.1);
            font-size: 13px;
            line-height: 1.9;
            -webkit-user-select: text;
            user-select: text;
            strong {
                color: var(--auth-link);
                font-weight: 600;
            }
            p {
                margin: 6px 0 0;
            }
        }

        .legal-body {
            font-size: 14px;
            line-height: 2;
            overflow-wrap: anywhere;
            -webkit-user-select: text;
            user-select: text;
            section {
                margin-top: 30px;
            }
            h2 {
                margin: 0 0 12px;
                color: var(--auth-link);
                font-size: 16px;
                font-weight: 600;
            }
            p {
                margin: 10px 0;
            }
            ul {
                margin: 10px 0;
                padding-left: 22px;
            }
            li {
                margin: 8px 0;
            }
            .important {
                padding-left: 16px;
                border-left: 3px solid var(--auth-border);
            }
            .legal-contact {
                padding-top: 24px;
                border-top: 1px solid var(--auth-border);
            }
            .legal-references {
                color: var(--auth-muted);
                font-size: 12px;
            }
        }

        @media screen and (max-width: 500px) {
            padding: 20px;
            .legal-body {
                font-size: 13px;
            }
        }
    }
}
</style>
