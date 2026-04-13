const BEEHIIV_URL = "https://subscribe-forms.beehiiv.com/822dceb7-ab66-4012-86cd-ce2fed390c34";

const NewsletterCard = () => (
  <div className="bg-card rounded-xl overflow-hidden border-2 border-dashed border-primary/30 h-full flex flex-col items-center justify-center p-6 text-center min-h-[280px]">
    <span className="text-2xl mb-3">✉️</span>
    <h3 className="text-lg font-semibold text-foreground mb-1">Fique por dentro</h3>
    <p className="text-sm text-muted-foreground mb-4">Receba insights semanais sobre tecnologia e inovação.</p>
    <iframe
      src={BEEHIIV_URL}
      className="beehiiv-embed w-full"
      data-test-id="beehiiv-embed"
      frameBorder="0"
      scrolling="no"
      style={{ height: 100, background: "transparent", border: "none", maxWidth: "100%" }}
    />
  </div>
);

export default NewsletterCard;
