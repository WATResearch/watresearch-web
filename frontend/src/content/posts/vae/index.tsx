import { InlineMath, BlockMath } from '../../../components/Math'
import AutoencoderDiagram from './AutoencoderDiagram'
import EncoderDiagram from './EncoderDiagram'
import LatentSpaceDiagram from './LatentSpaceDiagram'
import DecoderDiagram from './DecoderDiagram'
import ReconstructionLossDemo from './ReconstructionLossDemo'
import GapSamplingDemo from './GapSamplingDemo'
import PointVsDistributionDiagram from './PointVsDistributionDiagram'
import VAEArchitectureDiagram from './VAEArchitectureDiagram'
import ReparamDiagram from './ReparamDiagram'
import LossTradeoffDiagram from './LossTradeoffDiagram'

export default function VAE() {
  return (
    <>
      <h2>What are Autoencoders?</h2>

      <h3>The Basic Idea</h3>
      <p>
        An autoencoder is a network trained to compress something down to a small representation, then
        reconstruct the original from that representation alone - graded on how close the reconstruction
        is to the original. Feed it an image made of thousands of pixel values, and it squashes those
        down into a small list of numbers, then tries to rebuild the exact same image from just those
        numbers. The better the reconstruction, the better the network.
      </p>
      <AutoencoderDiagram />

      <h3>The Encoder</h3>
      <p>
        The first half of the autoencoder network is the <strong>encoder</strong>. Its job is to take the input data, which
        could be thousands of numbers (a 256x256 image has 65,536 pixels), and map it down to a much smaller
        list of numbers. This smaller list is called the <strong>latent vector</strong>, or <strong>latent code</strong>.
      </p>
      <p>
        The encoder learns
        to extract the most important features of the data and represent them in a compact form. In summary,
        the encoder is a function that takes large inputs and produces much smaller representations.
      </p>
      <EncoderDiagram />

      <LatentSpaceDiagram />

      <h3>The Decoder</h3>
      <p>
        The second half is the <strong>decoder</strong> — the mirror image of the encoder. It takes a point in latent
        space and maps it back up to the original size. Small to big. If the encoder learned a good
        summary, the decoder can reconstruct something close to the original from it.
      </p>
      <DecoderDiagram />

      <h3>The Reconstruction Loss</h3>
      <p>
        The network is trained using a single signal: how different is the output from the input?
        This difference is called the <strong>reconstruction loss</strong>. For images, you can measure it pixel by
        pixel — square the difference at each pixel, sum it up. The network adjusts its weights to
        minimize this number.
      </p>
      <p>
        There are no labels, no human annotations. The input itself is the target. This makes
        autoencoders <strong>self-supervised</strong> — they create their own training signal.
      </p>
      <ReconstructionLossDemo />

      <h3>The Problem with Autoencoders</h3>
      <p>
        A standard autoencoder compresses data into a latent code and reconstructs it. The encoder
        maps input <InlineMath math="x" /> to a point <InlineMath math="z" /> in latent space; the
        decoder maps <InlineMath math="z" /> back to <InlineMath math="x" />.
      </p>
      <p>
        This works well for
        compression, but the latent space has no structure — nearby points don't correspond to
        similar data, and random points decode to garbage. You can't sample new data because there's
        no meaningful distribution over the latent space. The autoencoder memorizes, but it doesn't
        generalize.
      </p>
      <GapSamplingDemo />

      {/* ===== SECTION 2: The VAE Idea ===== */}
      <h2>What is a Variational Autoencoder (VAE)?</h2>
      <p>
        A Variational Autoencoder (VAE) is a type of autoencoder that learns a <strong>structured latent space</strong>.
        The key difference from a standard autoencoder is that instead of mapping each input to a single
        point in the latent space, the encoder maps it to a <strong>distribution</strong> — a small
        region in the latent space around a point with some spread.
      </p>
      <PointVsDistributionDiagram />
      <p>
        The encoder no longer says "this image lives exactly at
        point <InlineMath math="z" />." Instead, it says "this image lives <em>somewhere around here</em>, give
        or take."
      </p>
      <p>
        During training, we sample a point from that distribution and feed it to the decoder.
        This forces the decoder to handle not just a single point, but a whole neighbourhood of points,
        which fills the gaps that made the standard autoencoder's latent space so sparse and
        unstructured. The result is a smooth, continuous latent space where similar inputs are close
        together, and you can sample new points to generate new data.
      </p>

      <h3>Means and Variances</h3>
      <p>
        Concretely, the encoder outputs two vectors instead of one:
      </p>
      <ul>
        <li>A <strong>mean vector</strong> <InlineMath math="\boldsymbol{\mu}" /> — the center of the region where the input most likely lives</li>
        <li>A <strong>variance vector</strong> <InlineMath math="\boldsymbol{\sigma}^2" /> — how spread out that region is</li>
      </ul>
      <p>
        Together they define a Gaussian distribution for each dimension of the latent space. We then
        sample a point <InlineMath math="z" /> from that distribution and pass it to the decoder.
      </p>
      <VAEArchitectureDiagram />
      <p>
        Crucially, each input gets its
        own <InlineMath math="\boldsymbol{\mu}" /> and <InlineMath math="\boldsymbol{\sigma}^2" />.
        A cat image might encode
        to <InlineMath math="\boldsymbol{\mu} = [1.2, -0.4, \ldots]" />, a dog
        to <InlineMath math="\boldsymbol{\mu} = [-0.8, 1.1, \ldots]" />. The decoder receives
        different <InlineMath math="z" /> values for different inputs — that's the only way it can
        reconstruct them correctly.
      </p>

      <h3>The Reparameterization Trick</h3>
      <p>
        There's a problem. Sampling is a random operation, and thus you can't backpropagate through it to train the network -
        the gradients can't flow through a random sampling step.
      </p>
      <p>
        The fix is called the <strong>reparameterization trick</strong>. Instead of
        sampling <InlineMath math="z" /> directly from the distribution, you sample a random noise value from the standard normal
        distribution <InlineMath math="\boldsymbol{\epsilon} \sim \mathcal{N}(0, I)" /> and then transform it using the mean and
        variance:
      </p>
      <BlockMath math="z = \boldsymbol{\mu} + \boldsymbol{\sigma} \odot \boldsymbol{\epsilon}" />
      <p>
        The randomness is now
        in <InlineMath math="\boldsymbol{\epsilon}" />, which is not a learned parameter, so gradients can flow cleanly through
        {' '}<InlineMath math="\boldsymbol{\mu}" /> and <InlineMath math="\boldsymbol{\sigma}" /> back into the encoder. This simple trick
        is what makes VAEs trainable with standard backpropagation.
      </p>
      <ReparamDiagram />

      <h3>The Loss</h3>
      <p>
        Training a VAE requires balancing two objectives at once.
      </p>
      <p>
        The first is the <strong>reconstruction loss</strong>, which measures how close
        the decoder's reconstruction is to the encoder's original input. For images, this is often the mean squared error (MSE)
        over pixels:
      </p>
      <BlockMath math="\mathcal{L}_{\text{recon}} = \| x - \hat{x} \|^2" />
      <p>
        where <InlineMath math="x" /> is the original input and <InlineMath math="\hat{x}" /> is the decoder's output. Minimizing
        this loss encourages the VAE to reconstruct inputs accurately.
      </p>
      <p>
        The second objective is a <strong>KL divergence</strong> term that pushes the
        encoder's learned distribution towards a standard normal distribution <InlineMath math="\mathcal{N}(0, I)" />. For a latent
        space of dimension <InlineMath math="d" />, the KL divergence can be computed in closed form as:
      </p>
      <BlockMath math="\mathcal{L}_{\text{KL}} = -\frac{1}{2} \sum_{j=1}^{d} \left(1 + \log \sigma_j^2 - \mu_j^2 - \sigma_j^2 \right)" />
      <p>
        Breaking this down:
      </p>
      <ul>
        <li><InlineMath math="-\mu^2" /> penalizes means that are far from zero</li>
        <li><InlineMath math="-\sigma^2 + 1 + \log \sigma^2" /> penalizes variances that are far from one</li>
      </ul>
      <p>
        Together, these terms encourage the encoder to produce distributions that are close to the standard normal,
        which regularizes the latent space and allows for meaningful sampling. The full VAE loss is a sum of the reconstruction loss and the KL divergence terms:
      </p>
      <BlockMath math="\mathcal{L} = \mathcal{L}_{\text{recon}} + \mathcal{L}_{\text{KL}}" />
      <p>
        You might wonder: why doesn't the network just map every input to exactly <InlineMath math="\mathcal{N}(0, I)" /> to drive
        the KL term to zero?
      </p>
      <p>
        The answer is that because then, every image would encode to the same distribution. The decoder would
        receive the same latent code <InlineMath math="z \sim \mathcal{N}(0, I)" /> regardless of the input, and thus can't learn
        to reconstruct anything meaningful. The reconstruction loss makes that catastrophic.
      </p>
      <p>
        The network is forced to give each
        input a distinct <InlineMath math="\boldsymbol{\mu}" /> so that the decoder can tell inputs apart, while the KL term prevents
        those means from drifting to arbitrary regions of the latent space. The two losses settle on a middle ground: each input gets a
        distribution close enough to the origin that the latent space stays well-organized, with enough spread that there are no gaps
        that the decoder hasn't seen.
      </p>
      <LossTradeoffDiagram />

      {/* TODO - Add ELBO Section */}

      <h2>Sampling and the Prior</h2>
      <p>
        To generate new data at inference time, you skip the encoder entirely, sample from the prior
        distribution <InlineMath math="\mathcal{N}(0, I)" />,
        and pass it to the decoder.
      </p>
      <p>
        Because the latent space is continuous and regularized, you can also interpolate: a linear path from
        {' '}<InlineMath math="z_a" /> to <InlineMath math="z_b" /> produces a smooth transition in data space. You can even do
        arithmetic — <InlineMath math="z_{\text{smile, woman}} - z_{\text{neutral, woman}} + z_{\text{neutral, man}}" /> produces something close to
        a smiling man.
      </p>
      <p>
        But here's the honest truth: the actual aggregate distribution of <InlineMath math="z" /> values
        the encoder produces during training is not exactly <InlineMath math="\mathcal{N}(0, I)" />:
      </p>
      <BlockMath math="q(z) = \frac{1}{N}\sum_{i=1}^{N} \mathcal{N}(\mu_i, \sigma_i^2)" />
      <p>
        This is a <strong>mixture of Gaussians</strong> — cats cluster in one region, dogs in another. The
        prior <InlineMath math="\mathcal{N}(0, I)" /> approximates this mixture but never matches it
        exactly. This mismatch is why VAE-generated images tend to look blurry: you're sampling from
        where you <em>assumed</em> the data lives, not exactly where it does.
      </p>

      <h2>Posterior Collapse</h2>
      <p>
        The most notorious failure mode of VAEs is <strong>posterior collapse</strong>. The encoder learns to ignore the input and output and predict
        {' '}<InlineMath math="q(z|x) = \mathcal{N}(0, I)" /> for every <InlineMath math="x" />. The KL term drops to zero, but the latent
        code carries zero information about <InlineMath math="x" /> - the decoder compensates by becoming a generative model that ignores
        {' '}<InlineMath math="z" /> entirely.
      </p>
      <p>
        This happens because a powerful decoder can model <InlineMath math="p(x)" /> well enough without <InlineMath math="z" />, so the
        optimization finds it easier to zero out the KL. Common mitigations include:
      </p>
      <ul>
        <li><strong>KL annealing</strong> — gradually increasing the weight of the KL term from 0 to 1 during training</li>
        <li><strong>Free bits</strong> — enforcing a minimum KL per dimension</li>
        <li><strong>Architectural bottlenecks</strong> — forcing the decoder to rely on <InlineMath math="z" /></li>
      </ul>
    </>
  )
}
