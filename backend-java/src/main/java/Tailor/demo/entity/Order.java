package Tailor.demo.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "garment_type", nullable = false, length = 50)
    private String garmentType;

    @Convert(converter = JsonMapConverter.class)
    @Column(name = "measurements", nullable = false, columnDefinition = "TEXT")
    private Map<String, String> measurements;

    @Column(name = "delivery_date", nullable = false)
    private LocalDate deliveryDate;

    @Column(name = "est_hours", nullable = false)
    private Integer estHours;

    @Column(name = "order_date")
    private LocalDate orderDate;

    @Column(name = "phone", length = 15)
    private String phone;

    @Column(name = "style", columnDefinition = "TEXT")
    private String style;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "fabric_photo", columnDefinition = "TEXT")
    private String fabricPhoto;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "advance_amount")
    private Double advanceAmount;

    @Column(name = "status", length = 30)
    private String status = "BOOKED";

    @Column(name = "token", length = 4, unique = true)
    private String token;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // Getters and setters
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getGarmentType() { return garmentType; }
    public void setGarmentType(String garmentType) { this.garmentType = garmentType; }

    public Map<String, String> getMeasurements() { return measurements; }
    public void setMeasurements(Map<String, String> measurements) { this.measurements = measurements; }

    public LocalDate getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(LocalDate deliveryDate) { this.deliveryDate = deliveryDate; }

    public Integer getEstHours() { return estHours; }
    public void setEstHours(Integer estHours) { this.estHours = estHours; }

    public LocalDate getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getFabricPhoto() { return fabricPhoto; }
    public void setFabricPhoto(String fabricPhoto) { this.fabricPhoto = fabricPhoto; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public Double getAdvanceAmount() { return advanceAmount; }
    public void setAdvanceAmount(Double advanceAmount) { this.advanceAmount = advanceAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
