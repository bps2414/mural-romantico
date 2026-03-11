const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

/**
 * Converte toda a estrutura .agents importada para .github estrutural do Copilot
 * @param {string} destAgents O diretorio destino onde a copy crua (.agents) aportou
 * @param {string} destBase A raiz do repositorio final
 */
async function convertToVsCode(destAgents, destBase) {
    const gitHubDir = path.join(destBase, '.github');
    const copilotInstructionsDir = path.join(gitHubDir, 'instructions');

    await fs.ensureDir(copilotInstructionsDir);

    console.log(chalk.dim('   [VS Code] Convertendo arquivos para sintaxe do Copilot...'));

    // 1. Converter a rule master GEMINI.md em copilot-instructions.md
    const geminiPath = path.join(destAgents, 'rules', 'GEMINI.md');
    if (await fs.pathExists(geminiPath)) {
        let content = await fs.readFile(geminiPath, 'utf8');
        // Adaptamos os caminhos na rule principal para o contexto do .github/ do VS Code
        content = content.replace(/\.\/\.agents\/skills\//g, './.github/instructions/');
        content = content.replace(/\.\/\.agents\/vault\//g, './.copilot-vault/');
        content = content.replace(/\.\/\.agents\/rules\/GEMINI\.md/g, './.github/copilot-instructions.md');

        // As workflows no VS Code estao desabrigadas da pasta nativa, sugerimos le-las do vault ou inline
        content += `\n\n## 🔄 Workflows Base\nAs workflows antigas de Cursor (/brainstorm, etc) agora devem ser invocadas naturalmente no chat: "Rode o fluxo de brainstorm". Consulte o AGENTS.md para contexto.\n`;

        await fs.writeFile(path.join(gitHubDir, 'copilot-instructions.md'), content);
    }

    // 2. Converter as skills nativas (ativas) em glob .instructions.md
    const skillsDest = path.join(destAgents, 'skills');
    if (await fs.pathExists(skillsDest)) {
        const skillsDirs = await fs.readdir(skillsDest);
        for (const skillName of skillsDirs) {
            const skillFile = path.join(skillsDest, skillName, 'SKILL.md');
            if (await fs.pathExists(skillFile)) {
                let content = await fs.readFile(skillFile, 'utf8');

                // Injetamos um frontmatter basico aceitavel pelo Copilot apontando para tudo (**/*) 
                // para que a Skill ative independente do arquivo no Workspace se for convocada.
                const vsCodeContent = `---
description: ${skillName.replace(/-/g, ' ')}
applyTo: "**/*"
---
${content}`;
                await fs.writeFile(path.join(copilotInstructionsDir, `${skillName}.instructions.md`), vsCodeContent);
            }
        }
    }

    // 3. Converter o Vault Index (Tudo que esta no index vira uma mera instruction text base local)
    const vaultIndexSrc = path.join(destAgents, 'VAULT_INDEX.md');
    if (await fs.pathExists(vaultIndexSrc)) {
        let content = await fs.readFile(vaultIndexSrc, 'utf8');
        content = content.replace(/\.\/\.agents\/vault\//g, './.copilot-vault/');
        await fs.writeFile(path.join(copilotInstructionsDir, 'VAULT_INDEX.instructions.md'), content);
    }

    // 4. Mover o Vault inteiro para uma pasta customizada oculta que nao polua a base restrita do Git / do Copilot local
    const vaultSrc = path.join(destAgents, 'vault');
    const copilotVaultDir = path.join(destBase, '.copilot-vault');
    if (await fs.pathExists(vaultSrc)) {
        await fs.move(vaultSrc, copilotVaultDir, { overwrite: true });
    }

    // 5. Consolidar as 20 personas (AGENTS) num unico arquivao master na root do github chamado AGENTS.md
    const agentsSrc = path.join(destAgents, 'agents');
    if (await fs.pathExists(agentsSrc)) {
        const agentFiles = await fs.readdir(agentsSrc);
        let consolidatedAgents = `# 🤖 Antigravity Copilot Agents Roster\n\n`;
        for (const agent of agentFiles) {
            if (agent.endsWith('.md')) {
                const content = await fs.readFile(path.join(agentsSrc, agent), 'utf8');
                consolidatedAgents += `\n## Agent: ${agent.replace('.md', '')}\n${content}\n---\n`;
            }
        }
        await fs.writeFile(path.join(gitHubDir, 'AGENTS.md'), consolidatedAgents);
    }

    // Limpeza pesada! Como o ambiente ja foi migrado de .agents para .github e .copilot-vault, delete a origem da instalacao hibrida.
    await fs.remove(destAgents);
}

module.exports = { convertToVsCode };
