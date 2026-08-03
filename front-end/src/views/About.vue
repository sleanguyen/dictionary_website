<template>
  <div class="about-page">
    <div class="coffee-card">
      <h1 class="ui header coffee-title">
        <i class="id badge outline icon"></i>
        <div class="content">
          About Me
          <div class="sub header coffee-subheader">Student Profile — COMP1842 Coursework</div>
        </div>
      </h1>

      <div class="ui segment coffee-segment">
        <table class="ui very basic table coffee-table">
          <tbody>
            <tr>
              <td><strong>Full Name</strong></td>
              <td>Nguyen Luong Gia Bao</td>
            </tr>
            <tr>
              <td><strong>Student ID</strong></td>
              <td>GCS240315</td>
            </tr>
            <tr>
              <td><strong>Course</strong></td>
              <td>COMP1842 — Web Programming 2 </td>
            </tr>
            <tr>
              <td><strong>Project</strong></td>
              <td>Dictionary</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About'
}
</script>

<style scoped>
.about-page {
  --bg-espresso: #2C1F1A;
  --bg-mocha: #6F4E37;
  --text-taupe: #B7A89A;
  --accent-gold: #C2A878;

  display: flex;
  justify-content: center;
  padding: 2.5rem 1rem;
}

.coffee-card {
  width: 100%;
  max-width: 680px;
  background-color: var(--bg-espresso);
  border: 1px solid rgba(194, 168, 120, 0.3);
  border-radius: 12px;
  padding: 2rem 2.25rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.coffee-title {
  color: var(--accent-gold) !important;
  align-items: center;
}

.coffee-title .icon {
  color: var(--accent-gold) !important;
}

.coffee-subheader {
  color: var(--text-taupe) !important;
  font-weight: 400;
}

.coffee-segment {
  background-color: var(--bg-mocha) !important;
  border: 1px solid rgba(194, 168, 120, 0.25) !important;
  border-radius: 8px !important;
  box-shadow: none !important;
  margin-top: 1.5rem;
}

.coffee-table {
  background: transparent !important;
}

.coffee-table td {
  color: var(--text-taupe) !important;
  border-top: 1px solid rgba(194, 168, 120, 0.15) !important;
  padding: 0.85rem 0.5rem;
}

.coffee-table tr:first-child td {
  border-top: none !important;
}

.coffee-table td strong {
  color: var(--accent-gold) !important;
}
</style>