import anthropicIcon from '@/assets/aiProviders/anthropic.svg'
import baichuanIcon from '@/assets/aiProviders/baichuan.svg'
import deepseekIcon from '@/assets/aiProviders/deepseek.svg'
import doubaoIcon from '@/assets/aiProviders/doubao.svg'
import geminiIcon from '@/assets/aiProviders/gemini.svg'
import moonshotIcon from '@/assets/aiProviders/moonshot.svg'
import ollamaIcon from '@/assets/aiProviders/ollama.svg'
import openaiIcon from '@/assets/aiProviders/openai.svg'
import openrouterIcon from '@/assets/aiProviders/openrouter.svg'
import qwenIcon from '@/assets/aiProviders/qwen.svg'
import xaiIcon from '@/assets/aiProviders/xai.svg'
import zhipuIcon from '@/assets/aiProviders/zhipu.svg'

const localProviderIcons = {
    anthropic: anthropicIcon,
    baichuan: baichuanIcon,
    deepseek: deepseekIcon,
    doubao: doubaoIcon,
    gemini: geminiIcon,
    moonshot: moonshotIcon,
    ollama: ollamaIcon,
    openai: openaiIcon,
    openrouter: openrouterIcon,
    qwen: qwenIcon,
    xai: xaiIcon,
    zhipu: zhipuIcon
}

export const aiProviderPresets = [
    {
        key: 'openai',
        name: 'OpenAI',
        iconSlug: 'openai',
        aliases: ['chatgpt', 'gpt', 'oai'],
        baseUrl: 'https://api.openai.com/v1'
    },
    {
        key: 'anthropic',
        name: 'Anthropic',
        iconSlug: 'anthropic',
        aliases: ['claude'],
        baseUrl: 'https://api.anthropic.com'
    },
    {
        key: 'deepseek',
        name: 'DeepSeek',
        iconSlug: 'deepseek',
        aliases: ['deep seek'],
        baseUrl: 'https://api.deepseek.com'
    },
    {
        key: 'gemini',
        name: 'Gemini',
        iconSlug: 'gemini',
        aliases: ['google', 'google ai', 'bard'],
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta'
    },
    {
        key: 'qwen',
        name: 'Qwen',
        iconSlug: 'qwen',
        aliases: ['tongyi', 'tongyi qianwen', 'aliyun'],
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    },
    {
        key: 'ollama',
        name: 'Ollama',
        iconSlug: 'ollama',
        aliases: ['local model'],
        baseUrl: 'http://localhost:11434/v1'
    },
    {
        key: 'xai',
        name: 'xAI',
        iconSlug: 'xai',
        aliases: ['grok'],
        baseUrl: 'https://api.x.ai/v1'
    },
    {
        key: 'zhipu',
        name: 'Zhipu',
        iconSlug: 'zhipu',
        aliases: ['glm', 'chatglm', '智谱'],
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4'
    },
    {
        key: 'moonshot',
        name: 'Moonshot',
        iconSlug: 'moonshot',
        aliases: ['kimi'],
        baseUrl: 'https://api.moonshot.cn/v1'
    },
    {
        key: 'baichuan',
        name: 'Baichuan',
        iconSlug: 'baichuan',
        aliases: ['百川'],
        baseUrl: 'https://api.baichuan-ai.com/v1'
    },
    {
        key: 'doubao',
        name: 'Doubao',
        iconSlug: 'doubao',
        aliases: ['豆包', 'volcengine', 'ark'],
        baseUrl: 'https://ark.cn-beijing.volces.com/api/v3'
    },
    {
        key: 'openrouter',
        name: 'OpenRouter',
        iconSlug: 'openrouter',
        aliases: ['router'],
        baseUrl: 'https://openrouter.ai/api/v1'
    },
    {
        key: 'siliconflow',
        name: 'SiliconFlow',
        iconSlug: 'siliconcloud',
        aliases: ['silicon cloud', '硅基流动'],
        baseUrl: 'https://api.siliconflow.cn/v1'
    }
]

export function normalizeProviderKey(value = '') {
    return `${value}`.trim().toLowerCase()
}

export function matchProviderPreset(value = '') {
    const keyword = normalizeProviderKey(value)
    if (!keyword) return null
    return (
        aiProviderPresets.find((item) => {
            if (item.key === keyword) return true
            if (normalizeProviderKey(item.name) === keyword) return true
            return item.aliases.some((alias) => normalizeProviderKey(alias) === keyword)
        }) || null
    )
}

export function searchProviderPresets(value = '') {
    const keyword = normalizeProviderKey(value)
    if (!keyword) return aiProviderPresets
    return aiProviderPresets.filter((item) => {
        const searchPool = [item.key, item.name, ...(item.aliases || [])]
        return searchPool.some((part) => normalizeProviderKey(part).includes(keyword))
    })
}

export function getProviderIconCandidates(value = '') {
    const preset = matchProviderPreset(value)
    if (!preset?.iconSlug) return []
    const target = localProviderIcons[preset.iconSlug]
    return target ? [target] : []
}
