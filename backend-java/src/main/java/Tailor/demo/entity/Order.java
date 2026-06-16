package Tailor.demo.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    // This links the Order directly to the Customer who made it
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "garment_type", nullable = false, length = 50)
    private String garmentType;

    // This magically saves your Java Map directly into PostgreSQL as JSONB!
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "measurements", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> measurements;

    @Column(name = "est_hours", nullable = false)
    private Integer estHours;

    @Column(name = "status", length = 30)
    private String status = "BOOKED";

    @Column(name = "delivery_date", nullable = false)
    private LocalDate deliveryDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public String getGarmentType() {
        return garmentType;
    }

    public void setGarmentType(String garmentType) {
        this.garmentType = garmentType;
    }

    public Map<String, Object> getMeasurements() {
        return measurements;
    }

    public void setMeasurements(Map<String, Object> measurements) {
        this.measurements = measurements;
    }

    public Integer getEstHours() {
        return estHours;
    }

    public void setEstHours(Integer estHours) {
        this.estHours = estHours;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDate deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // TODO: Right-click here and generate Getters and Setters!
}