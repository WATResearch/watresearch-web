import { InlineMath, BlockMath } from '../../../components/Math'
import AutoregressiveDemo from './AutoregressiveDemo'
import MemoryBandwidthDemo from './MemoryBandwidthDemo'

export default function SPECULATIVE_DECODING() {
  return (
    <>
      <h2>Inference with Large Transformer Language Models</h2>

      <h3>Autoregressive Generation</h3>
      <p>
        When a language model generates text, it works one token at a time.
        A token is roughly a word or word-fragment ("speculative" for instance,
        might be one token, while "decoding" is another). To generate each token,
        looks at every token that came before it and asks: "given everything so
        far, what most likely comes next?"
      </p>
      <p>
        Formally, at each step <InlineMath math="t" /> the model computes a probability distribution{' '}
        <InlineMath math="P(x_t \mid x_{<t})" />, which is the probability of each possible next token given
        the prefix <InlineMath math="x_{<t}" />. It then samples from that distribution to pick <InlineMath math="x_t" />,
        appends it, and repeates.
      </p>
      <p>
        The critical constraint: step <InlineMath math="t" /> cannot begin until step <InlineMath math="t-1" /> is complete,
        because <InlineMath math="x_t" /> depends on <InlineMath math="x_{t-1}" />. There is no way around this. Generating{' '}
        <InlineMath math="K" /> tokens therefore requires <InlineMath math="K" /> serial runs of the model, one after another in
        sequence, with no parallelism possible across the output.
      </p>
      <AutoregressiveDemo />

      <p>
        This is the fundamental bottleneck. Each run of a large model is expensive,
        and you need <InlineMath math="K" /> of them, back to back.
      </p>

      <h3>The Memory Bandwidth Bottleneck</h3>
      <p>
        You might expect that making a model twice as fast is simply a matter of having
        twice as much compute, i.e. faster chips and more GPUs. For autoregressive
        inference, however, the bottleneck isn't in the arithmetic operations. It's in
        the memory.
      </p>
      <p>
        Every time the model runs a forward pass to produce one token, it has to load its
        weights from GPU memory (VRAM) into the compute cores. For a model like T5-XXL at
        11 billion parameters, that's tens of GBs of data moving across the memory bus for
        every single token. The actual matrix multiplications, once the weights are loaded,
        take comparatively little time. The GPU's arithmetic units sit largely idle, waiting
        for the next wave of weights to arrive.
      </p>

      <MemoryBandwidthDemo />

      <p>
        This is called being memory-bandwidth bound. The speed limit isn't how fast you can
        compute, but rather it's how fast you can move data.
      </p>
      <p>
        The implication is subtle but important. Because arithmetic capacity is underutilized
        during each decode step, there is spare compute available, which is capacity that is
        paid for but going unused. If you could find a way to do useful work with that spare
        capacity without increasing the number of memory loads, you would get that work essentially
        for free. This is what speculative decoding exploits.
      </p>

      <h2>The Speculative Decoding Algorithm</h2>

      <h3>Draft and Verify</h3>
      <p>
        The algorithm runs in two phases each speculative decoding step. First,
        the draft model, a small and fast model <InlineMath math="M_q" />, runs autoregressively
        for <InlineMath math="\gamma" /> steps, producing <InlineMath math="\gamma" /> candidate
        tokens <InlineMath math="x_1, x_2, \ldots, x_\gamma" />. Because <InlineMath math="M_q" /> is
        cheap, this costs little relative to a single run of the large target
        model <InlineMath math="M_p" />.
      </p>
      <p>
        Second, <InlineMath math="M_p" /> runs once, in paralell, evaluating
        all <InlineMath math="\gamma" /> candidate continuations simultaneously. A single Transformer
        forward pass over a sequence naturally produces probability distribution at every position.
        So running <InlineMath math="M_p" /> on the prefix plus all <InlineMath math="\gamma" /> draft
        tokens gives <InlineMath math="\gamma + 1" /> distributions{' '}
        <InlineMath math="p_1, p_2, \ldots, p_{\gamma+1}" /> in one shot. This is the key: the
        Transformer's parallel nature, which can't help during generation, can absolutely help during
        verification.
      </p>
      <p>
        Each drafted token is then checked against <InlineMath math="M_p" />'s distribution at that
        position. Tokens <InlineMath math="M_p" /> agrees with are accepted. The first one it
        disagrees with is rejected, replaced by a corrected sample, and everything after it
        discarded. The iteration returns between 1 and <InlineMath math="\gamma + 1" /> tokens
        (always at least 1 so it's never worse than standard decoding).
      </p>

      <h3>Why This Works</h3>
      <p>
        The scheme is only useful if <InlineMath math="M_q" /> agrees
        with <InlineMath math="M_p" /> often enough. Why would a model two orders of magnitude
        smaller agree with one two orders of magnitude larger?
      </p>
      <p>
        Because most tokens in a fluent sequence aren't hard. Given sufficient context, the vast
        majority of token chocies are unambiguous — common words, syntactic completions, predictable
        continuations that any reasonable language model would agree on. The large model's scale
        matters most at a small fraction of steps: unusual word choices, subtle factual claims,
        complex reasoning jumps. For everything else, a small model is right for the same reason the
        large model is right.
      </p>
      <p>
        The paper measures this with the acceptance rate <InlineMath math="\alpha" />, the
        probability that a draft token passes verification. Empirically, with a draft model
        roughly 100× smaller than the target, <InlineMath math="\alpha" /> sits between 0.6 and 0.9
        depending on task and sampling temperature. The expected number of tokens produced
        per <InlineMath math="M_p" /> call is then:
      </p>
      <BlockMath math="\mathbb{E}[\text{tokens}] = \frac{1 - \alpha^{\gamma+1}}{1 - \alpha}" />
      <p>
        At <InlineMath math="\alpha = 0.8" /> with <InlineMath math="\gamma = 5" />, this is roughly
        3.7 tokens per large-model call — nearly a 4× reduction in the number of
        serial <InlineMath math="M_p" /> runs required.
      </p>
      <p>
        Counterintuitively, harder tasks tend to produce higher <InlineMath math="\alpha" />. Under
        low temperature or argmax sampling, the output distribution is sharp — there are very few
        valid next tokens — and a small model is just as likely to land on the right one as a large
        model.
      </p>

      <h3>The Rejection Sampling Step</h3>

      <h3>Guaranteeing the Same Distribution</h3>

      <h2>Why It's a Free Lunch</h2>

      <h3>Expected Speedup</h3>

      <h3>Acceptance Rate and Draft Length</h3>
    </>
  )
}
