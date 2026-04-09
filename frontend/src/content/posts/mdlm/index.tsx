import NoiseComparisonDemo from './NoiseComparisonDemo'
import ForwardProcessDemo from './ForwardProcessDemo'
import DifficultyDemo from './DifficultyDemo'
import GenerationComparisonDemo from './GenerationComparisonDemo'
import ForwardProcessDiagram from './ForwardProcessDiagram'
import InterpolationFormula from './InterpolationFormula'
import ReverseProcessDemo from './ReverseProcessDemo'
import SUBSDemo from './SUBSDemo'
import TrainingObjectiveDemo from './TrainingObjectiveDemo'
import TrainingTricksDemo from './TrainingTricksDemo'
import SamplingDemo from './SamplingDemo'
import ResultsChart from './ResultsChart'

export default function MDLM() {
  return (
    <>
      {/* ===== SECTION 1: Why Diffusion Struggles with Text ===== */}
      <h2>Why Diffusion Struggles with Text</h2>
      <p>
        Diffusion models work by gradually adding noise to data, then learning to reverse that process.
        For images, the concept of "noising" is straightforward: we just blur the pixels. Text on the
        other hand, is made up of discrete tokens. Words either are or aren't there, and you can't have
        a "fraction" of a word. This makes the noising process fundamentally awkward for text.
      </p>

      <NoiseComparisonDemo />

      <p>
        Early work like D3PM tried to handle this by treating "noising" as a giant table of
        probabilities — at each step, every token has some chance of turning into every other token in
        the vocabulary. Track that across hundreds of steps and you have an explosion of numbers to
        compute, keep stable, and learn from. The models trained on this were slow, brittle, and
        ultimately bad at generating text. On a standard benchmark (LM1B), D3PM scored a perplexity
        of ≤77.50, while an equivalently-sized GPT-style model sat at 22 (think of perplexity as how
        "surprised" the model is by real text, so lower is much better, and that gap was enormous).
        The natural question was whether diffusion was just fundamentally ill-suited for text, or
        whether the approach was simply over-complicated from the start.
      </p>

      {/* ===== SECTION 2: What Is Masked Diffusion? ===== */}
      <h2>What Is Masked Diffusion?</h2>

      <p>
        Instead of D3PM's complex probability tables, masked diffusion makes a brutally simple choice:
        when corrupting text, just replace tokens with [MASK].
      </p>

      <ForwardProcessDemo />

      <p>
        The model learns one thing from this: given a partially masked sentence, predict what was
        originally there. More masked = harder problem.
      </p>

      <DifficultyDemo />

      <p>
        This sounds like BERT — but there's a key difference. BERT masks randomly with no sense of
        time. MDLM turns this into a proper probabilistic process, which means you can run it in
        reverse to generate text.
      </p>

      <GenerationComparisonDemo />

      {/* ===== SECTION 3: The Forward Process ===== */}
      <h2>The Forward Process</h2>

      <p>
        We represent each token as a one-hot vector over a vocabulary of size K. A sequence of
        length L is written as x₀ = (x₀¹, x₀², ..., x₀ᴸ), where each x₀ⁱ is a one-hot vector.
        The forward process defines a sequence of increasingly corrupted versions of this sequence:
        x₀, x₁, ..., x_T, where t=0 is clean and t=T is fully masked. Each x_t lives on the
        categorical simplex Δᴷ — a probability distribution over K tokens.
      </p>

      <ForwardProcessDiagram />

      <p>
        The math behind this is surprisingly simple. The distribution of x_t given the clean data x₀ is:
      </p>
      <p>
        <strong>q(x_t | x₀) = Cat(x_t ; α_t · x₀ + (1 − α_t) · m)</strong>
      </p>
      <p>
        where <strong>m</strong> is the one-hot vector for [MASK] (the last category in the vocabulary),
        and <strong>α_t</strong> is a strictly decreasing noise schedule that goes from α₀ = 1 (fully
        clean) to α_T = 0 (fully masked).
      </p>
      <p>
        Let's break this formula down. At any time t, each token independently either:
      </p>
      <ul>
        <li>stays as itself with probability α_t (the "clean" part), or</li>
        <li>becomes [MASK] with probability 1 − α_t (the "noise" part)</li>
      </ul>
      <p>
        The noise schedule α_t is the only knob that controls the speed of corruption. Unlike D3PM's
        K×K transition matrices, this is just a <strong>scalar interpolation</strong> — no matrix math needed.
        This simplicity is what makes everything downstream tractable.
      </p>

      <InterpolationFormula />

      {/* ===== SECTION 4: The Reverse Process ===== */}
      <h2>The Reverse Process</h2>

      <p>
        The reverse process is what we actually use to <strong>generate</strong> text. Starting from a
        fully masked sequence at t = T, we iteratively denoise step by step back to t = 0.
      </p>
      <p>
        At each step, we need to compute p_θ(x_s | x_t) — the probability of a slightly cleaner
        version x_s given the current noisy version x_t (where s &lt; t). The MDLM approach works
        in two stages:
      </p>
      <ol>
        <li>
          <strong>Predict the clean data:</strong> The denoising network x̂_θ(x_t, t) takes the
          current masked sequence and the timestep, and outputs its best guess of the original
          clean data x₀. For each masked position, it produces a probability distribution over
          the vocabulary.
        </li>
        <li>
          <strong>Step backward:</strong> Using the predicted x̂₀ and the known forward process,
          we compute what x_s should look like via Bayes' rule. Concretely, for each token position:
          if it's currently [MASK], we either unmask it (with some probability based on the step
          size) or keep it masked for now. If it's already unmasked, we just keep it.
        </li>
      </ol>
      <p>
        The model doesn't predict x_s directly — it always predicts x₀ (the fully clean data),
        and the forward process math handles the rest. This is the same "predict x₀" trick used
        in image diffusion models.
      </p>

      <ReverseProcessDemo />

      {/* ===== SECTION 5: Two Properties That Keep It Simple (SUBS) ===== */}
      <h2>Two Properties That Keep It Simple</h2>

      <p>
        MDLM bakes two domain-specific properties directly into the network's output. Together
        they're called <strong>SUBS</strong> (for "substitutions"), and they dramatically simplify
        both the model and the math.
      </p>

      <h3>Property 1: Zero Masking Probability</h3>
      <p>
        The original clean data x₀ never contains [MASK] tokens — [MASK] is a corruption artifact,
        not a real word. So the model should <strong>never predict [MASK]</strong> as its output.
        We enforce this by setting the logit corresponding to [MASK] to −∞ before the softmax.
        After softmax, the probability of [MASK] becomes exactly 0, and the remaining probabilities
        renormalize over real tokens.
      </p>

      <h3>Property 2: Carry-Over Unmasking</h3>
      <p>
        If a token is already unmasked (i.e., it's a real word, not [MASK]), there's nothing to
        predict — just copy it through unchanged. We enforce this by substituting the network's
        output at unmasked positions with a one-hot copy of the input. The network only needs
        to "think" about the masked positions.
      </p>
      <p>
        Why does this matter? These two simple tricks eliminate entire terms from the loss function.
        Without them, the model would waste capacity learning things that are trivially true by
        construction (like "don't predict [MASK]" and "don't change revealed tokens"). With SUBS,
        the math simplifies from a complex multi-term ELBO into something remarkably clean.
      </p>

      <SUBSDemo />

      {/* ===== SECTION 6: The Training Objective ===== */}
      <h2>The Training Objective</h2>

      <p>
        Generative models are typically trained by maximizing the Evidence Lower Bound (ELBO) — or
        equivalently, minimizing the Negative ELBO (NELBO). For general discrete diffusion, this
        involves summing over all timesteps and all possible transitions, which is expensive. But
        thanks to the SUBS parameterization, MDLM's objective collapses into something beautiful:
      </p>
      <p>
        <strong>L = Σᵢ 𝔼_t [ w(t) · CE(x̂_θ(x_t, t)ⁱ, x₀ⁱ) · 𝟙(x_tⁱ = [MASK]) ]</strong>
      </p>
      <p>
        Let's dissect this piece by piece:
      </p>
      <ul>
        <li>
          <strong>Σᵢ</strong> — Sum over all positions i in the sequence. Every token contributes
          to the loss.
        </li>
        <li>
          <strong>𝔼_t</strong> — Sample a random timestep t from [0, 1]. Each training step uses
          a different masking rate.
        </li>
        <li>
          <strong>w(t) = −α′_t / (1 − α_t)</strong> — A weighting function that controls how
          much each timestep contributes. Early timesteps (few masks) get lower weight; later
          timesteps (many masks) get higher weight. This is derived from the math, not hand-tuned.
        </li>
        <li>
          <strong>CE(x̂_θ(x_t, t)ⁱ, x₀ⁱ)</strong> — Cross-entropy between the model's prediction
          at position i and the true token. This is exactly the standard classification loss.
        </li>
        <li>
          <strong>𝟙(x_tⁱ = [MASK])</strong> — We only compute loss on masked positions. Unmasked
          tokens are handled by the carry-over property, so they contribute zero loss.
        </li>
      </ul>
      <p>
        Here's the punchline: <strong>this is literally a weighted mixture of BERT-style masked
        language modeling losses at different masking rates.</strong> At low t, few tokens are masked
        (easy predictions, low weight). At high t, most tokens are masked (hard predictions, high
        weight). The weighting w(t) is what turns this from ad-hoc BERT training into a proper
        variational lower bound with mathematical guarantees.
      </p>

      <TrainingObjectiveDemo />

      {/* ===== SECTION 7: Training Tricks That Matter ===== */}
      <h2>Training Tricks That Matter</h2>

      <p>
        One of MDLM's key contributions isn't a new theorem — it's engineering. The authors show
        that masked diffusion models are far more capable than previously thought, if you train
        them properly. Here are the tricks that made the difference:
      </p>

      <h3>Tokenization</h3>
      <p>
        D3PM used a vocabulary of just 8K tokens. MDLM uses GPT-2's 32K vocabulary. Larger
        vocabulary means shorter sequences for the same text, which means the model needs to
        capture shorter-range dependencies. This single change dramatically improves both diffusion
        and autoregressive models.
      </p>

      <h3>Architecture: Diffusion Transformer (DiT)</h3>
      <p>
        Instead of the T5 architecture used in D3PM, MDLM uses a Diffusion Transformer — an
        encoder-only transformer with rotary positional embeddings (RoPE) and timestep conditioning
        via Adaptive Layer Normalization (AdaLN). The timestep t is injected into every layer
        through the normalization parameters, giving the model a strong sense of "how noisy is
        my input right now?"
      </p>

      <h3>Low-Discrepancy Sampler</h3>
      <p>
        During training, we need to sample random timesteps t for each element in a batch.
        Naive i.i.d. sampling can leave gaps — some regions of [0, 1] get over-sampled while
        others are missed. MDLM uses a low-discrepancy sampler that spreads samples more evenly
        across the interval, reducing the variance of the ELBO estimate and leading to more
        stable training.
      </p>

      <h3>Numerical Stability</h3>
      <p>
        Previous discrete diffusion implementations materialized full K×K transition matrices
        and posterior distributions. Since MDLM only needs masked positions (thanks to SUBS),
        it can evaluate the objective by examining only the masked token indices. This avoids
        numerical overflow issues that plagued earlier implementations.
      </p>

      <TrainingTricksDemo />

      {/* ===== SECTION 8: Generating Text ===== */}
      <h2>Generating Text</h2>

      <p>
        At inference time, generation starts from a sequence of all [MASK] tokens. The model
        then runs T reverse steps, progressively unmasking tokens. At each step, the model
        predicts all masked positions simultaneously — unlike autoregressive models which
        generate one token at a time.
      </p>
      <p>
        But there's a practical problem: diffusion models are trained on fixed-length sequences.
        How do you generate text of arbitrary length? MDLM solves this with <strong>semi-autoregressive
        generation</strong>:
      </p>
      <ol>
        <li>Generate the first block of tokens using full diffusion (all [MASK] → text)</li>
        <li>Slide a context window to the right, keeping some generated tokens as context</li>
        <li>Fill the new positions with [MASK] and run diffusion again</li>
        <li>Repeat until you've generated the desired length</li>
      </ol>
      <p>
        This combines the parallel generation advantage of diffusion (many tokens per step within
        a block) with the arbitrary-length capability of autoregressive models. Each block benefits
        from full bidirectional context — the model can see both left and right context when making
        predictions, unlike AR models which can only see the left.
      </p>

      <SamplingDemo />

      {/* ===== SECTION 9: Results ===== */}
      <h2>Results</h2>

      <p>
        MDLM dramatically narrows the gap between diffusion and autoregressive models. On the
        One Billion Words (LM1B) benchmark:
      </p>
      <ul>
        <li>Previous best diffusion model (SEDD): 32.79 perplexity</li>
        <li><strong>MDLM (33B tokens): 27.04 perplexity</strong> — a massive jump</li>
        <li><strong>MDLM (327B tokens): 23.00 perplexity</strong> — nearly matching AR's 20.86</li>
        <li>For reference, D3PM scored ≤77.50. MDLM cut the gap to AR by over 90%.</li>
      </ul>
      <p>
        On zero-shot generalization — evaluating models trained on OpenWebText against unseen
        datasets — MDLM consistently outperforms SEDD across all 7 benchmarks. Remarkably,
        on Lambada and Scientific Papers, MDLM actually <strong>beats the autoregressive
        baseline</strong>. The hypothesis: diffusion models may be more robust to out-of-domain
        data because the unmasking objective encourages a more global understanding of text
        structure.
      </p>
      <p>
        The impact extends beyond benchmarks. ByteDance adopted masked diffusion for
        Seed Diffusion — the fastest industry-grade diffusion LLM. Nvidia uses it in
        Genmol for molecular generation. The message is clear: masked diffusion is not
        just a theoretical curiosity. With proper engineering, it's a competitive paradigm
        for language generation.
      </p>

      <ResultsChart />
    </>
  )
}
